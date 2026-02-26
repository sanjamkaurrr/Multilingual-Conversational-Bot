from rapidfuzz import process, fuzz

def fuzzy_search(user_query: str, qa_pairs, threshold=60):
    print("🔍 User query received:", user_query)

    questions = [item["question"] for item in qa_pairs]

    match = process.extractOne(user_query, questions, scorer=fuzz.WRatio)

    if match:
        best_question, score, idx = match
        print(f"🎯 Best fuzzy match: '{best_question}' with score {score}")

        if score >= threshold:
            print("✅ Match above threshold")
            return qa_pairs[idx]["answer"], score

    print("⚠️ No good match found")
    return "Sorry, I couldn't find a relevant answer.", 0