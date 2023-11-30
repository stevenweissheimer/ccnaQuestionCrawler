import json

def convert_question_format(question, courses):
    course_id = question["courseId"]
    subcourse_id = question["subCourseId"]
    category_id = question["categoryId"]

    # Find the course, subcourse, and category names using the provided courses data
    course_name = None
    subcourse_name = None
    category_name = None

    for course in courses["courses"]:
        if course["courseId"] == course_id:
            course_name = course["name"]

            for subcourse in course["subcourses"]:
                if subcourse["subCourseId"] == subcourse_id:
                    subcourse_name = subcourse["name"]

                    for category in subcourse["categories"]:
                        if category["categoryId"] == category_id:
                            category_name = category["name"]
                            break

                    break

            break

    # Replace '\r\n' with HTML line breaks
    question_text = question.get('questionText', '').replace('\r\n', '<br>')
    question_image_url = f"https://raw.githubusercontent.com/stevenweissheimer/ccnaQuestionCrawler/main/public/images/{question.get('questionImage', '')}"

    # Generate the question HTML
    question_html = f"<p style='font-size: 22px;'>{question['question']}</p>"
    if question_text:
        question_html += f"<p style='font-size: 16px;'>{question_text}</p>"
    # Append the URL to the image, if it exists
    if question.get('questionImage'):
        question_html += f"<p><img style='width: 100%;' src='{question_image_url}' alt='Question Image'></p>"

    # Check if questionFile exists and add the link if it does
    question_file_link = ""
    if question.get('questionFile'):
        question_file_link = f"<br><br><a href='https://raw.githubusercontent.com/stevenweissheimer/ccnaQuestionCrawler/main/public/files/{question['questionFile']}'>Link to Question File</a>"

    # Append the link to the question file
    question_html += question_file_link

    # Generate the answer HTML
    answer_html = f"<div>{question.get('answersDescription', '')}</div>"

    converted_question = {
        "question": question_html,
        "answer": answer_html,
        "categories": [f"{subcourse_name} - {category_name}", f"{subcourse_name}"],
        "mchoice": []
    }

    for idx, answer in enumerate(question['answers']):
        answer_entry = {
            "answerNbr": idx,
            "answer": f"<div>{answer.get('title', '')}</div>",
            "correct": int(answer['correct'])
        }
        converted_question["mchoice"].append(answer_entry)

    return converted_question

def process_questions(input_file, output_file, courses_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        questions = json.load(file)

    with open(courses_file, 'r', encoding='utf-8') as courses_file:
        courses = json.load(courses_file)

    converted_questions = [convert_question_format(q, courses) for q in questions]

    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(converted_questions, file, indent=3, ensure_ascii=False)

# Replace 'questions.json', 'converted_questions.json', and 'courses.json'
# with your actual file names.
process_questions('questions.json', 'converted_questions.json', 'courses.json')
