import os
import requests
from bs4 import BeautifulSoup
import base64
import json
import re
import time

links_filepath = 'links.json'
jsons_folder_path = 'jsons'
images_folder_path = 'Images'

def read_links():
    with open(links_filepath, 'r') as file:
        links_data = json.load(file)
    return links_data['links']

def generate_random_id():
    return str(round((10 ** 12) * (1 + (time.time() - int(time.time())))))

def download_image(url, image_name):
    if url.startswith('data:'):
        # If it's a data URL, extract the base64-encoded data
        _, data = url.split(',', 1)
        image_data = base64.b64decode(data)

        # Save the image data to a file
        image_path = os.path.join(images_folder_path, image_name)
        with open(image_path, 'wb') as image_file:
            image_file.write(image_data)
    else:
        # If it's a regular URL, use the requests library
        response = requests.get(url, stream=True)
        image_path = os.path.join(images_folder_path, image_name)
        with open(image_path, 'wb') as image_file:
            for chunk in response.iter_content(chunk_size=128):
                image_file.write(chunk)
                
def extract_data(url, course, section):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    questions = []
    is_question_section = False  # Flag to indicate if the current section contains questions

    for element in soup.find_all(['p', 'strong', 'ul']):
        # Check if the element is part of the question section
        if element.name == 'strong' and re.match(r'\d+\.', element.get_text()):
            is_question_section = True
            continue

        if not is_question_section:
            continue

        question_id = generate_random_id()
        question_text = ' '.join(element.stripped_strings)

        is_image_question = element.find('img') is not None
        image_path = f"{question_id}.png" if is_image_question else None

        if is_image_question:
            image_url = element.find('img')['src']
            download_image(image_url, image_path)

        options = element.find_all('li') if element.name == 'ul' else []
        mchoice = [
            {
                'answerId': generate_random_id(),
                'answerNbr': i,
                'answer': option.get_text(strip=True),
                'correct': 1 if option.find('span', style="color: #ff0000;") else 0
            }
            for i, option in enumerate(options)
        ]

        explanation_element = element.find_next('div', class_='message_box success').find('p') if element.find_next('div', class_='message_box success') else None
        explanation = explanation_element.get_text(strip=True) if explanation_element else ''

        questions.append({
            'questionId': question_id,
            'question': question_text,
            'image': is_image_question,
            'imagePath': image_path,
            'mchoice': mchoice,
            'course': course,
            'section': section,
            'explanation': explanation
        })

    return questions


def process_links():
    links = read_links()

    for link in links:
        data = extract_data(link['url'], link['course'], link['section'])
        if data:
            file_name = f"{generate_random_id()}"
            file_path = os.path.join(jsons_folder_path, f"{file_name}.json")

            with open(file_path, 'w') as json_file:
                json.dump(data, json_file, indent=2)

            print(f"Daten für {link['course']} - {link['section']} wurden in {file_path} gespeichert.")

if __name__ == "__main__":
    if not os.path.exists(jsons_folder_path):
        os.makedirs(jsons_folder_path)

    if not os.path.exists(images_folder_path):
        os.makedirs(images_folder_path)

    process_links()
