import pandas as pd

def load_qa(file_path: str):
    print("📥 Loading Excel file:", file_path)

    # Read Excel into a DataFrame
    df = pd.read_excel(file_path)

    qa_pairs = []

    # Convert each row into a dictionary
    for _, row in df.iterrows():
        qa_pairs.append({
            "answer": str(row["answer"]).strip(),
            "question": str(row["question"]).strip()
        })

    print(f"✅ Loaded {len(qa_pairs)} Q&A pairs into memory")

    return qa_pairs 