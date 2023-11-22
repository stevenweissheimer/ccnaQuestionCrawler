import json

def convert_question_format(question):
    converted_question = {
        "question": f"<div>{question['question']}</div>",
        "answer": f"<div>{question['answers'][2]['title']}</div>",
        "categories": [f"{question['subCourseId']}-{question['categoryId']}"],
        "mchoice": []
    }

    for idx, answer in enumerate(question['answers']):
        answer_entry = {
            "answerNbr": idx,
            "answer": f"<div>{answer['title']}</div>",
            "correct": int(answer['correct'])
        }
        converted_question["mchoice"].append(answer_entry)

    return converted_question

def process_questions(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        questions = json.load(file)

    converted_questions = [convert_question_format(q) for q in questions]

    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(converted_questions, file, indent=3, ensure_ascii=False)

# Replace 'questions.json' and 'converted_questions.json' with your actual file names.
process_questions('questions.json', 'converted_questions.json')
