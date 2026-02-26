from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import time
from googletrans import Translator
translator = Translator()


from Data_loader import load_qa   # 👈 your existing import
from search import fuzzy_search  # 👈 your existing import

# =========================
# 🔧 LOGGING CONFIG
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("chatbot")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 📦 LOAD DATA
# =========================
logger.info("📂 Loading QA data from Excel...")
qa_data = load_qa("qa.xlsx")
logger.info(f"✅ QA data loaded. Total entries: {len(qa_data)}")

# =========================
# 🧾 REQUEST MODEL
# =========================
class QueryRequest(BaseModel):
    question: str
    lang: str = "en"   # 🌐 NEW: language support

# =========================
# 🌐 TRANSLATION HOOKS 
# =========================
def translate_hi_to_en(text: str) -> str:
    logger.info(f"🌐 [translate_hi_to_en] Input: {text}")
    return translator.translate(text, src="hi", dest="en").text

def translate_en_to_hi(text: str) -> str:
    logger.info(f"🌐 [translate_en_to_hi] Input: {text}")
    return translator.translate(text, src="en", dest="hi").text

# =========================
# 🤖 CHAT ENDPOINT
# =========================
@app.post("/chat")
def chat(req: QueryRequest):
    start_time = time.time()

    logger.info("📩 Incoming /chat request")
    logger.info(f"👤 Question from UI: {req.question}")
    logger.info(f"🌐 Language selected: {req.lang}")

    # Translate Hindi -> English if needed (hook)
    if req.lang == "hi":
        user_question_en = translate_hi_to_en(req.question)
    else:
        user_question_en = req.question

    # 🔎 Fuzzy search (your existing logic)
    logger.info("🔍 Running fuzzy search...")
    answer_en, score = fuzzy_search(user_question_en, qa_data)

    logger.info(f"🎯 Fuzzy match score: {score}")

    # Translate back if Hindi (hook)
    if req.lang == "hi":
        final_answer = translate_en_to_hi(answer_en)
    else:
        final_answer = answer_en

    # Truncate long logs
    logger.info(f"📤 Final answer sent (preview): {final_answer[:80]}...")

    elapsed = round((time.time() - start_time) * 1000, 2)
    logger.info(f"⏱️ Request handled in {elapsed} ms")

    return {
        "answer": final_answer,
    }