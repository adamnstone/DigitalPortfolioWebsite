# Expert Network Map

## Overview

[Here is a link to the `Expert Network Map`!](https://pub.fabcloud.io/project/expert-network-map/)

The `Expert Network Map` is a network analysis research project to locate hidden expertise in the Fab Academy community and democratize access to helpful documentation.

I was invited by [MIT Professor Neil Gershenfeld](https://ng.cba.mit.edu/) to present this project at the [FAB23 Bhutan: Designing Resilient Futures](https://fab23.fabevent.org/) conference in Bhutan. This conference, focused on using technology to realize a collective vision for the shared future, is the 19th edition of the International Fab Lab Conference and Symposium, the largest digital fabrication event in the world.

<iframe width="560" height="315" src="https://www.youtube.com/embed/F12IUwdAcgs?si=glPwne61UZXOQMvC&hd=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Project Description

### Background

My most significant research project was creating the `Expert Network Map`, an analysis of 1000+ members of the Fab Academy open-source community to locate hidden expertise in 18 subject areas and an interactive visualization of the network. Fab Academy is a digital fabrication course focused on rapid-prototyping led by MIT Professor Neil Gershenfeld. All Fab Academy students keep a documentation website detailing the process of completing projects, and students are encouraged to seek out others’ documentation to navigate technical roadblocks. For an example of a documentation website, see mine [here](https://fabacademy.org/2023/labs/charlotte/students/adam-stone/). To give credit to content referenced, students add links in their own websites to the documentation websites they found helpful. For example, in my documentation website, I linked [Nidhie Dhiman](https://fabacademy.org/2022/labs/charlotte/students/nidhie-dhiman/)'s documentation for help with embroidery. 

![Reference Example](../../assets/images/stem/expert-network-map/reference-example.jpg)

### Problem, Hypothesis, and Prototype

While I knew who had helpful documentation in my Charlotte Fab community, with over 1000 documentation websites globally, there was a lot of untapped expertise I couldn’t locate. I recognized that if expert documentation could quickly be identified, all students would be able to work more efficiently. 

I hypothesized that the more times students’ documentation websites were referenced by their peers in a subject area, the more expertise they possessed. As a test, I ran a network analysis of the 13 students in the Charlotte Fab community, quantifying the number of times each student’s documentation website was referenced by their peers. The analysis yielded promising results: some students had significantly more references than the rest of the peer group, and student were frequently linking each other's websites. Read more about my initial prototypes [here](https://fabacademy.org/2023/labs/charlotte/students/adam-stone/lessons/side-projects/lab-link-graph/#iteration-1) and [here](https://fabacademy.org/2023/labs/charlotte/students/adam-stone/lessons/side-projects/lab-link-graph/#iteration-2).

![Test Graph](../../assets/images/stem/expert-network-map/test-graph.jpg)

### Pitch

I showed the results to my local lab leader, [Mr. Dubick](https://www.linkedin.com/in/tomdubick), who suggested that I talk to Professor Gershenfeld and propose analyzing the global Fab community network to identify experts by topic. Professor Gershenfeld believed the network analysis would be incredibly valuable and connected me with a mentor in Spain, [Francisco Sanchez Arroyo](https://www.fablabs.io/users/francisco), who advised me on the best tools and structure to use.

## Project Execution

### GitLab Repo

I executed the project in three distinct phases: I wrote a script to collect the data, designed a text-classification AI model to sort links by subject area, and utilized D3JS to present the data in an interactive visualization.

You can download all the code from the project in [this GitLab repo](https://gitlab.fabcloud.org/pub/project/expert-network-map). In the repo, you will also find [`documentation.md`](https://gitlab.fabcloud.org/pub/project/expert-network-map/-/blob/main/documentation.md?ref_type=heads), a file that lists the technical changes made in each iteration of the project.

### Step 1: Scrape the Data

For the first step, I wrote a `Python` script to scrape all Fab Academy students’ documentation website GitLab repos over the past six years using the [`Python-GitLab API`](https://python-gitlab.readthedocs.io/en/stable/api-usage.html) and scan for URL references to other student websites using [`RegEx`](https://docs.python.org/3/library/re.html). I also stored 1,000 characters before and after to use for classification and used Pandas to create a reference matrix that structured the data for analysis. My program yielded a database of ~29,000 references.

### Step 2: Categorize the Data

After the data were collected, I knew I had a significant challenge. For the network analysis to be useful, I needed to calculate the number of times a student’s documentation was referenced for a specific subject area. I had collected tens of thousands of pages of documentation text that used vastly different naming conventions for each subject area (for example, "3D Scanning & Printing" vs "3d.printing.and.scanning"), and much of the text understandably had spelling errors given that many Fab Academy students do not speak English as a first language. To overcome the challenge of categorizing references by subject area with no consistent naming convention, I created a text-classification neural network. Using a list of keywords that were often associated with a Fab Academy subject-area, for example "PLA filament" for "3D Printing," I was able to classify ~13,000 of the ~29,000 references based on the surrounding text. Find a `JSON` file of the keywords I used for each subject area below.

```json
{
  "Prefab": [],
  "Computer-Aided Design": [
    "Computer-Aided Design",
    "freecad"
  ],
  "Computer-Controlled Cutting": [
    "Laser Cut",
    "CCC week",
    "Computer-Controlled Cutting"
  ],
  "Embedded Programing": [
    "Embedded Programming",
    "MicroPython",
    "C++",
    "pythoncpp",
    "ino",
    "Arduino IDE",
    "programming week"
  ],
  "3D Scanning and Printing": [
    "3D Printing",
    "3D Scanning",
    "TPU",
    "PETG",
    "filament",
    "Prusa",
    "3d printing week",
    "polyCAM",
    "3D Scanning and Printing",
    "3d printers",
    "3d printer"
  ],
  "Electronics Design": [
    "EagleCAD",
    "Eagle",
    "KiCAD",
    "Routing",
    "Auto-Route",
    "Trace",
    "Footprint",
    "electronic design",
    "Electronics Design"
  ],
  "Computer-Controlled Machining": [
    "CNC",
    "Shopbot",
    "Computer-Controlled Machining"
  ],
  "Electronics Production": [
    "Mill",
    "Milling",
    "copper",
    "electronic production",
    "Electronics Production"
  ],
  "Mechanical Design, Machine Design": [
    "Machine week",
    "actuation and automation",
    "Mechanical Design, Machine Design"
  ],
  "Input Devices": [
    "Input Devices",
    "Input Device",
    "Inputs Devices",
    "Electronic input",
    "sensor",
    "Input Devices"
  ],
  "Moulding and Casting": [
    "Part A",
    "Part B",
    "pot time",
    "pottime",
    "molding",
    "moulding",
    "casting",
    "cast",
    "Moulding and Casting"
  ],
  "Output Devices": [
    "Output Device",
    "Outputs Devices",
    "Outputs Device",
    "Servo",
    "motor",
    "Output Devices"
  ],
  "Embedded Networking and Communications": [
    "SPI",
    "UART",
    "I2C",
    "RX",
    "TX",
    "SCL",
    "networking week",
    "networking",
    "network",
    "networking and communications",
    "Embedded Networking and Communications"
  ],
  "Interface and Application Programming": [
    "Interfacing Week",
    "interface week",
    "Interface and Application Programming"
  ],
  "Wildcard Week": [
    "Wildcard Week"
  ],
  "Applications and Implications": [
    "Applications and Implications",
    "Bill-of-Materials",
    "Bill of materials"
  ],
  "Invention, Intellectual Property and Business Models": [
    "Patent",
    "copyright",
    "trademark",
    "Invention, Intellectual Property and Business Models"
  ],
  "Final Project": [
    "Final Project"
  ],
  "Other": []
}
```

To classify the remaining ~16,000 references, I trained my own text-classification neural network off of the 1,000 characters before and after each of the ~13,000 already classified references using `Python` and [`PyTorch`](https://pytorch.org/). I designed the neural network with 5,000 input nodes, a hidden layer of 200 nodes, and 18 output nodes (one for each Fab Academy subject area). To format the data for the neural network, I used the [`Sci-Kit Learn CountVectorizer`](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html) to tokenize the text surrounding each URL, and the resulting matrix was converted to a [`NumPy`](https://numpy.org/) array and then to a [`PyTorch tensor`](https://pytorch.org/docs/stable/tensors.html). To train the neural network, I implemented [`Cross-Entropy Loss`](https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html) as the loss function to measure the model's performance in predicting the correct subject-area, and I employed the [`Adam optimizer`](https://pytorch.org/docs/stable/generated/torch.optim.Adam.html) to adjust the model's weights. After [hyperparameter tuning](https://aws.amazon.com/what-is/hyperparameter-tuning/#:~:text=Hyperparameter%20tuning%20allows%20data%20scientists,the%20model%20as%20a%20hyperparameter.) using a grid-search algorithm, the model achieved its best accuracy of **86.3%** using a *learning rate of 0.01* and *dropout rate of 0.1*. 

```py
# Define grid of hyperparameters
learning_rates = [0.1, 0.01, 0.001]
dropout_rates = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

# Perform the grid search
best_accuracy = 0.0
best_lr = None
best_dropout_rate = None
best_model = None

for lr in learning_rates:
    for dropout_rate in dropout_rates:
        # train_model is defined earlier
        accuracy, model = train_model(lr, dropout_rate)
        print(f'Learning rate: {lr}, Dropout rate: {dropout_rate}, Accuracy: {accuracy}')
        
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_lr = lr
            best_dropout_rate = dropout_rate
            best_model = model
```

The model successfully classified the remaining  ~16,000 references, completing the second step of my project. 

### Step 3: Visualize the Data

Lastly, I wanted to provide the global Fab community with an easy-to-use navigation tool to locate expert documentation by subject area, as identified in my network analysis. I consulted with Mr. Arroyo and decided to create an interactive force simulation graph using [`D3.js`](https://d3js.org/). In the graph, each node represents a student and each edge represents references between students. 

![Student Node Example](../../assets/images/stem/expert-network-map/student-node-example.jpg)

The more times a student’s documentation website has been referenced, the larger the student’s node, corresponding to more expertise. Other data, such as a student’s Fab Lab location and graduation year, were encoded via other visual mediums. I added interactive features, such as filters for subject area, geography, and graduation year, to help students quickly identify experts based on their needs.

![Filters](../../assets/images/stem/expert-network-map/filters.jpg)

Because the first version of the `Expert Network Map` had tens of thousands of data points reloading in real-time, the tool was too slow to be usable. I made two modifications to optimize performance. First, I used D3JS’ enter-update-exit protocol to change the force simulation graph without reloading all of the data. Next, I collapsed multiple references between the same students into a single edge with greater force. The `Expert Network Map` is live and will be used by Fab Academy 2024 students.