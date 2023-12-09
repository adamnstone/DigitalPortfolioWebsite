# Test Generator

The *Test Generator*, a website I created to streamline test making for educators, is in active use by the teachers in the Charlotte Latin School Innovation & Design Department. Using [Flask](https://flask.palletsprojects.com/en/3.0.x/), I created a website for teachers to easily create tests in Google Forms by inputting the test topic and number of questions. The back-end queries the [ChatGPT API](https://openai.com/blog/introducing-chatgpt-and-whisper-apis) and uses the [Google Forms](https://developers.google.com/forms/api/quickstart/python) and [OAuth APIs](https://testdriven.io/blog/oauth-python/) to create a new form in the teacher’s account.

I've limited the website to only Google Accounts I have approved since the API bills per request, but for a video demonstration, please see below:

**Video Demonstration**

<iframe width="560" height="315" src="https://www.youtube.com/embed/LxqLGD-RbZM?si=-pK1tKd7ll-7eHdc&hd=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Documentation

The most interesting aspect of this project was the networking with ChatGPT and Google Forms, not the HTML/CSS and Flask server. So, I'll cover the code for the backend of the project.

### ChatGPT

Let's break down the main code that interacts with ChatGPT, parses the response, and sends the formatted test to `google_forms.py`.

First the `_Test`, `Question`, and `Answer` classes. The code will eventually parse ChatGPT's response and convert it to a `_Test` object.

```py
class _Test(object):
    def __init__(self, title, questions):
        self.title = title # string
        self.questions = questions # list of Questions
        self.num_questions = len(questions)
        self.url = None

    def add_url(self, url):
        self.url = url

class Question(object):
    def __init__(self, question_title, potential_answers):
        self.question_title = question_title # string
        self.potential_answers = potential_answers # list of strings

class Answer(object):
    def __init__(self, answer_text, is_correct):
        self.answer_text = answer_text
        self.is_correct = is_correct
```

The `query` function sends an API request to OpenAI. It uses the model `gpt-3.5-turbo`.

```py
def query(txt):
    return openai.ChatCompletion.create(
        model= "gpt-3.5-turbo", # this is "ChatGPT" $0.002 per 1k tokens
        messages=[{"role": "user", "content": txt}]
    ).choices[0].message.content
```

The `create_test` function defines the prompt for ChatGPT and parses the response. The prompt asks ChatGPT to use special characters, such as `##`, to indicate different parts of the test. This method has been a relatively consistent means of extracting different parts of the text from ChatGPT text-based response.

```py
def create_test():      
    prompt = f'''
You are a teacher who creates tests. Here are some examples.

Prompt: Write a 3-question test about math
Answer:
##MEASURE OF MATH
^^What is 1+1?
||$$2
||-1
||1
||0
||us
^^Which of the following was a famous mathematician?
||Michael Jordan
||$$Albert Einstein
||Michael Jackson
^^What type of counting system do computers typically use?
||$$Binary
||Roman Numerals
||Base-10

Prompt: Write a 5-question test about geography
Answer:
##GRAPPLING WITH GEOGRAPHY
^^How many continents are there?
||$$7
||2
||6
||13
^^Which of the following is a country in Europe?
||China
||Iraq
||The United States
||$$France
||Uruguay
^^What are latitude and longitude?
||An antiquated method of measuring distance between multiple continents or planets
||$$A coordinate system by means of which the position or location of any place on Earth's surface can be determined and described
||Names of galaxies
^^North America is ____ of Europe.
||North
||South
||East
||$$West
^^What is the name of the largest country in the world?
||Canada
||Turkey
||Afghanistan
||$$Russia

Prompt: Write a {num_questions}-question test about {test_subject}
Answer:
    '''
    
    response = query(prompt)

    test_title = "TEST"
    question_title = "QUESTION"
    potential_answers = []
    questions = []

    for line in response.split("\n"):
        s_line = line.strip()
        prefix = s_line[:2]
        substance = s_line[2:]
        if prefix == "##":
            test_title = substance
        elif prefix == "^^":
            if len(questions) > 0:
                questions[-1] = Question(question_title, potential_answers)
            question_title = substance
            questions.append(None)
            potential_answers = []
        elif prefix == "||":
            correct = substance.strip()[:2] == "$$"
            potential_answers.append(Answer((substance.strip()[2:] if correct else substance), correct))
    if len(questions) > int(num_questions):
        questions = questions[:int(num_questions)]
```
Finally, the parsed data is put into a `_Test` object and sent to Google Forms.

```py
    test = _Test(test_title, questions[:-1])
    url = google_forms.create_form(creds, test.title, test.questions)
    test.add_url(url)
```

All together, here's the code that interacts with ChatGPT.

```py
class _Test(object):
    def __init__(self, title, questions):
        self.title = title # string
        self.questions = questions # list of Questions
        self.num_questions = len(questions)
        self.url = None

    def add_url(self, url):
        self.url = url

class Question(object):
    def __init__(self, question_title, potential_answers):
        self.question_title = question_title # string
        self.potential_answers = potential_answers # list of strings

class Answer(object):
    def __init__(self, answer_text, is_correct):
        self.answer_text = answer_text
        self.is_correct = is_correct

def query(txt):
    return openai.ChatCompletion.create(
        model= "gpt-3.5-turbo", # this is "ChatGPT" $0.002 per 1k tokens
        messages=[{"role": "user", "content": txt}]
    ).choices[0].message.content

def create_test():      
    prompt = f'''
You are a teacher who creates tests. Here are some examples.

Prompt: Write a 3-question test about math
Answer:
##MEASURE OF MATH
^^What is 1+1?
||$$2
||-1
||1
||0
||us
^^Which of the following was a famous mathematician?
||Michael Jordan
||$$Albert Einstein
||Michael Jackson
^^What type of counting system do computers typically use?
||$$Binary
||Roman Numerals
||Base-10

Prompt: Write a 5-question test about geography
Answer:
##GRAPPLING WITH GEOGRAPHY
^^How many continents are there?
||$$7
||2
||6
||13
^^Which of the following is a country in Europe?
||China
||Iraq
||The United States
||$$France
||Uruguay
^^What are latitude and longitude?
||An antiquated method of measuring distance between multiple continents or planets
||$$A coordinate system by means of which the position or location of any place on Earth's surface can be determined and described
||Names of galaxies
^^North America is ____ of Europe.
||North
||South
||East
||$$West
^^What is the name of the largest country in the world?
||Canada
||Turkey
||Afghanistan
||$$Russia

Prompt: Write a {num_questions}-question test about {test_subject}
Answer:
    '''
    
    response = query(prompt)

    test_title = "TEST"
    question_title = "QUESTION"
    potential_answers = []
    questions = []

    for line in response.split("\n"):
        s_line = line.strip()
        prefix = s_line[:2]
        substance = s_line[2:]
        if prefix == "##":
            test_title = substance
        elif prefix == "^^":
            if len(questions) > 0:
                questions[-1] = Question(question_title, potential_answers)
            question_title = substance
            questions.append(None)
            potential_answers = []
        elif prefix == "||":
            correct = substance.strip()[:2] == "$$"
            potential_answers.append(Answer((substance.strip()[2:] if correct else substance), correct))

    if len(questions) > int(num_questions):
        questions = questions[:int(num_questions)]

    test = _Test(test_title, questions[:-1])
    url = google_forms.create_form(creds, test.title, test.questions)
    test.add_url(url)
```

### Google Forms

Code in `google_forms.py` is responsible for creating the test in the user's Google Forms account. The code defines the API scopes, formats the data from the `_Test` object to the dictionary/JSON format specified in the [Google Forms API Documentation](https://developers.google.com/forms/api/reference/rest). It then uses the API to make the form into a quiz and selects the correct answers for each multiple choice question. Finally, the function returns the URL to the Google Form quiz.

```py
SCOPES = ["https://www.googleapis.com/auth/forms.body"]
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"

# create the Google Form
def create_form(creds, form_title, _questions):
    if creds is None:
        raise ValueError("Invalid credentials")
    
    form_service = discovery.build('forms', 'v1', credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)
    
    # Request body for creating a form
    NEW_FORM = {
        "info": {
            "title": form_title,
            "documentTitle": form_title
        }
    }

    questions = []

    for question in _questions:
        questions.append({})
        questions[-1]['title'] = question.question_title
        questions[-1]['questionItem'] = {
                        "question": {
                            "required": True,
                            "grading": {
                                "pointValue": 1,
                                "correctAnswers": {
                                    "answers": [{"value": ans.answer_text} for ans in question.potential_answers if ans.is_correct]
                                },
                                "whenRight": {"text": "You got it!"},
                                "whenWrong": {"text": "Sorry, that's wrong"}
                            },
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [
                                    {"value": ans.answer_text}
                                    for ans
                                    in question.potential_answers
                                ],
                                "shuffle": True
                            }
                        }
                    }

    # Request body to add a multiple-choice question
    question_requests = [ {
        "requests": [{
            "createItem": {
                "item": question,
                "location": {
                    "index": n
                }
            }
        }]
    }
    for n, question,
    in enumerate(questions)
    ]

    # Creates the initial form
    result = form_service.forms().create(body=NEW_FORM).execute()

    update = {
        "requests": [
            {
                "updateSettings": {
                    "settings": {
                        "quizSettings": {
                            "isQuiz": True
                        }
                    },
                    "updateMask": "quizSettings.isQuiz"
                }
            }
        ]
    }

    # Converts the form into a quiz
    question_setting = form_service.forms().batchUpdate(formId=result["formId"],
                                                        body=update).execute()

    # Adds the question to the form
    for qr in question_requests:
        question_setting = form_service.forms().batchUpdate(formId=result["formId"], body=qr).execute()

    # Store result from the API
    get_result = form_service.forms().get(formId=result["formId"]).execute()

    url = f"https://docs.google.com/forms/d/{result['formId']}/edit"

    return url
```