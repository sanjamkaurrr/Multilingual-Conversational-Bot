from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from deep_translator import GoogleTranslator
from chitchat import get_chitchat_response
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from Data_loader import load_qa
from search import fuzzy_search


class QueryRequest(BaseModel):
    question: str
    lang: str = "en"


class SuggestionRequest(BaseModel):
    partial_question: str
    lang: str = "en"


def translate_hi_to_en(text: str) -> str:
    if not text.strip():
        return text
    return GoogleTranslator(source="hi", target="en").translate(text)


def translate_en_to_hi(text: str) -> str:
    if not text.strip():
        return text
    return GoogleTranslator(source="en", target="hi").translate(text)


def get_suggestions(partial_question: str, qa_pairs, limit: int = 5):
    query = partial_question.strip().lower()
    if not query:
        return []

    matches = [
        item["question"]
        for item in qa_pairs
        if query in item["question"].lower()
    ]
    return matches[:limit]


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
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
qa_data = load_qa(os.path.join(BASE_DIR, "qa.xlsx"))
logger.info(f"✅ QA data loaded. Total entries: {len(qa_data)}")

# =========================
# 💡 SUGGESTION ENDPOINT
# =========================

@app.post("/suggest")
def suggest(req: SuggestionRequest):
    logger.info(f"💡 Suggest request: {req.partial_question}")

    # Translate if needed
    if req.lang == "hi":
        partial_en = translate_hi_to_en(req.partial_question)
    else:
        partial_en = req.partial_question

    suggestions_en = get_suggestions(partial_en, qa_data)

    # Translate back
    if req.lang == "hi":
        suggestions = [translate_en_to_hi(s) for s in suggestions_en]
    else:
        suggestions = suggestions_en

    return {"suggestions": suggestions}


# =========================
# 🤖 CHAT ENDPOINT
# =========================
@app.post("/chat")
def chat(req: QueryRequest):

    # 🌐 Translate if needed
    if req.lang == "hi":
        user_question_en = translate_hi_to_en(req.question)
    else:
        user_question_en = req.question

    # 🔥 STEP 1: Check chit-chat FIRST
    chit_response = get_chitchat_response(user_question_en)

    if chit_response:
        if req.lang == "hi":
            chit_response = translate_en_to_hi(chit_response)

        return {"answer": chit_response}

    # 🔍 STEP 2: Normal search
    answer_en, score = fuzzy_search(user_question_en, qa_data)

    # 🌐 Translate back
    if req.lang == "hi":
        final_answer = translate_en_to_hi(answer_en)
    else:
        final_answer = answer_en

    return {"answer": final_answer}
