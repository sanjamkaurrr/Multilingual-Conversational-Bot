import re


def get_chitchat_response(text: str):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s']", " ", text)
    text = re.sub(r"\bu\b", "you", text)
    text = re.sub(r"\br\b", "are", text)
    text = re.sub(r"\s+", " ", text).strip()

    chit_chat_map = {
        "hi": "Hey! How can I help you today?",
        "hello": "Hello! Ask me anything about UP policies.",
        "how are you": "I'm doing great. How can I assist you?",
        "how are you doing": "I'm doing great. How can I assist you?",
        "how are things": "I'm doing great. How can I assist you?",
        "what's up": "All good here. What would you like to know?",
        "whats up": "All good here. What would you like to know?",
        "who are you": "I'm your policy assistant bot here to help you.",
        "thank you": "You're welcome!",
        "thanks": "Happy to help!"
    }

    for key, response in chit_chat_map.items():
        if key in text:
            return response

    return None
