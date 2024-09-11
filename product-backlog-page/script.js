const firebaseConfig = {
    apiKey: "AIzaSyAv7LojAw2c_3bpSFyYpbZfCdr3Tm7so2Q",
    authDomain: "fit2101-cc7bc.firebaseapp.com",
    databaseURL: "https://fit2101-cc7bc-default-rtdb.firebaseio.com",
    projectId: "fit2101-cc7bc",
    storageBucket: "fit2101-cc7bc.appspot.com",
    messagingSenderId: "707950173273",
    appId: "1:707950173273:web:42aa3d6f3bf2be4a112548"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global array that helps with prefilling the edit form
let taskNames = [];

let selectedTags = {
    'tags': [],
    'edit-tags': []
};

const colorPriority = {
    'Important': ['#e06708', '#522604'],
    'Medium': ['#e08a00', '#4a2c00'],
    'Low': ['#59AB90', '#2e4d3b'],
    'Urgent': ['#e83013', '#4a0d0a']
}

const colorStatus = {
    'Not Started': ['#f0ad4e', '#4d3a1a'], 
    'In Progress': ['#5bc0de', '#1c4b4f'], 
    'Completed': ['#5cb85c', '#184a18'] 
};

const colorTags = {
    'Frontend': ['#d6b3e6', '#f3e9fd'], // Light Purple
    'Backend': ['#a3d8e6', '#eaf7f9'], // Light Cyan
    'UI': ['#99cfff', '#e6f3ff'], // Light Blue
    'UX': ['#a8e6a1', '#eaf7ea'], // Light Green
    'Database': ['#b3a6e6', '#f0e9fd'], // Light Indigo
    'API': ['#ffc299', '#fff2e6'], // Light Orange
    'Testing': ['#a1e6d1', '#eaf7f3'], // Light Teal
    'Framework': ['#c2c2c2', '#f2f2f2'] // Light Gray
};


// Loads all taskCards from Firebase when the window is loaded
window.onload = function() {
    // Load tasks from Firebase
    reloadTaskCards();
    sortTasks('date-asc')
}

// Function to show the overlay (Dims background)
function showOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

// Function to hide the overlay
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

// Function to show the popup overlay (Dims extended card popup)
function showPopupOverlay() {
    document.getElementById('popupoverlay').style.display = 'block';
}

// Function to hide the popup overlay
function hidePopupOverlay() {
    document.getElementById('popupoverlay').style.display = 'none';
}

// Handle opening and closing the task form
function openTaskForm() {
    document.getElementById("task-popup").style.display = "block";
    showOverlay();
}

function closeTaskForm() {
    document.getElementById("task-popup").style.display = "none";
    hideOverlay();
}

// Function to show the edit form
function openEditTaskForm() {
    let taskName = taskNames[taskNames.length - 1];
    document.getElementById("edit-task-popup").style.display = "block";
    showPopupOverlay();

    var user_ref = firebase.database().ref('taskCard/' + taskName)
    user_ref.on('value', function(snapshot){
        var data = snapshot.val()
        document.getElementById('edit-task-name').value = data.taskName;
        document.getElementById('edit-task-desc').value = data.taskDesc;
        document.getElementById('edit-priority').value = data.priority;
        document.getElementById('edit-story-points').value = data.storyPoints;
        document.getElementById('edit-Type').value = data.type;
        document.getElementById('edit-status').value = data.status;
        // Incomplete for displaying tags checkboxes
        // for (let i = 0; i < data.tags.length; i++) {
        //     console.log(data.tags[i]);
        //     selectedTags['edit-tags'].push(data.tags[i]);
        // }
    })

    // Set the onclick attribute for the save button
    const saveEditsButton = document.getElementById('save-edits-button');
    saveEditsButton.setAttribute('onclick', `saveEdits('${taskName}')`);
}

// Function to close the edit form
function closeEditTaskForm() {
    document.getElementById("edit-task-popup").style.display = "none";
    hidePopupOverlay();
}

// Open and close the delete confirmation popup
function openDeleteConfirmationPopUp() {
    document.getElementById('deletePopUp').style.display = 'block';
}

function closeDeleteConfirmationPopUp() {
    document.getElementById('deletePopUp').style.display = 'none';
}


// Functions below to retrieve array of tags from user through dropdown checkbox
function toggleDropdown(dropdownId) {
    document.getElementById(dropdownId).classList.toggle('show');
}

function updateTags(checkbox, dropdownId) {
    if (checkbox.checked) {
        if (selectedTags[dropdownId].length < 3) {
            selectedTags[dropdownId].push(checkbox.value);
        } else {
            checkbox.checked = false;
            alert('You can select up to 3 tags only.');
        }
    } else {
        selectedTags[dropdownId] = selectedTags[dropdownId].filter(tag => tag !== checkbox.value);
    }
}

document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName('dropdown-menu');
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
});

/**
 * Creates and appends a task card to the canvas.
 * @param {string} taskName - The name of the task.
 */
function addTaskCard(taskName) {

    // Viewing saved details
    var user_ref = firebase.database().ref('taskCard/' + taskName)
    user_ref.on('value', function(snapshot){
        var data = snapshot.val()

    const canvas = document.querySelector('.canvas');
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.priority = data.priority;
    taskCard.dataset.date = data.createTime;
    taskCard.dataset.tags = data.tags;
    taskCard.dataset.status = data.status;

    let taskBody='<h3 id="TaskHeader">'+data.taskName+'</h3>'

    taskBody+= '<div class="taskCardContent" id="TaskPriority" style="background-color:'+colorPriority[data.priority][0]+'; color:'+colorPriority[data.priority][1]+';">'+data.priority+'</div>';
    if (!Array.isArray(data.tags)) {
        taskBody += '<div class="taskCardContent" id="TaskTags1">' + data.tags + '</div>';
    } else {
        // Append tags in order from left to right
        taskBody += CreateTags(data.tags,'class="taskCardContent" id="TaskTags1"','class="taskCardContent" id="TaskTags2"','class="taskCardContent" id="TaskTags3"');
    }

    taskBody+='<div class="taskCardContent" id="TaskStoryPoints">'+data.storyPoints+'</div>';
    taskBody+='<div class="taskCardContent" id="TaskStatus" style="background-color:'+colorStatus[data.status][0]+'; color:'+colorStatus[data.status][1]+';">'+data.status+'</div>';

    taskCard.innerHTML = taskBody;

    // Add click event listener to open the task details popup
    //taskDesc, priority, tags, storyPoints, Type
    taskCard.addEventListener('click', function() {
        showDetailedTaskCard(taskName, data.taskName, data.taskDesc, data.priority, data.storyPoints, data.tags, data.type,data.status);
    });

    canvas.appendChild(taskCard);

    })
}

/**
 * Submits form data to Firebase and adds a task card to the canvas.
 */
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // If no tags have been selected
    if (selectedTags['tags'].length === 0) {
        alert('Please select at least one tag.');
        return;
    }

    const taskName = document.getElementById('task-name').value;
    const taskDesc = document.getElementById('task-desc').value;
    const priority = document.getElementById('priority').value;
    const storyPoints = document.getElementById('story-points').value;
    const tags = selectedTags['tags'];
    const type = document.getElementById('Type').value;
    const status = document.getElementById('Status').value
    const createTime = new Date().toISOString();

    // Store data into Firebase database
    firebase.database().ref('taskCard/' + taskName).set({
        taskName: taskName,
        taskDesc: taskDesc,
        priority: priority,
        storyPoints: storyPoints,
        tags: tags,
        type: type,
        status: status,
        createTime: createTime
    });

    firebase.database().ref('taskCard/' + taskName + '/log').push().set({
        user: 'admin',
        date: new Date().toString().slice(0,21).replace(/-/g,""),
        action: 'created'
    });

    // Add task card to canvas
    addTaskCard(taskName);

    // Close all task card and reload them
    const canvas = document.querySelector('.canvas');
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    reloadTaskCards();

    // Optionally, clear the form
    document.getElementById('task-form').reset();

    // Close the form
    closeTaskForm();

    // Clear the selected tags
    selectedTags['tags'] = [];
});

function CreateTags(data,id1,id2,id3) {
    let taskBody = '<div '+id1+' style="background-color:' + colorTags[data[0]][0] + ';">';
    if (data.length > 0) {
        taskBody += '<span class="tag";">' + data[0] + '</span> ';
    }
    taskBody += '</div>';

    if (data.length > 1) {
        taskBody += '<div '+id2+' style="background-color:' + colorTags[data[1]][0] + ';">';
        taskBody += '<span class="tag";">' + data[1] + '</span> ';
        taskBody += '</div>';
    }

    if (data.length > 2) {
        taskBody += '<div '+id3+' style="background-color:' + colorTags[data[2]][0] + ';">';
        taskBody += '<span class="tag" style="background-color:' + colorTags[data[2]][0] + ';">' + data[2] + '</span> ';
        taskBody += '</div>';
    }
    return taskBody;
}

// Function to show the detailed view of the task card
function showDetailedTaskCard(taskName, data_taskName, taskDesc, priority, storyPoints, tags, type, status) {
    // This adds html into the div with the id task-details-content
    const taskDetailsContent = document.getElementById('task-details-content');
    taskDetailsContent.innerHTML = `
        <div id = "ExtendStatus"style="background-color:`+colorStatus[status][0]+`; color:`+colorStatus[status][1]+`;">${status}</div>
        <div id="TaskDetailHeader">
            <strong>Task Name:</strong> <!-- Bold header -->
            <p>${data_taskName}</p> <!-- Task name on a new line -->
        </div>
        <div id="TaskDetailDesc">
            <strong>Task Description:</strong> 
            <p id='TaskDetails'>${taskDesc}</p>
        </div>
        <div id='assigned-to'>
            <strong>Assigned To:</strong>
            <p>Test User</p>
        </div>
        <div id = "TaskDetailParameters">
            <div id = "TopParametersRow">
                <div id = "LeftTop">
                    <p id = "DetailParameterText">Type</p>
                    <div id = "DetailValue">
                        ${type}
                    </div>
                </div>
                <div id = "RightTop">
                    <p id = "DetailParameterText">Priority</p>
                    <div id = "DetailValue" style="background-color:`+colorPriority[priority][0]+`; color:black;">
                        ${priority}
                    </div>
                </div>
            </div>
            <div id = "BottomParametersRow">
                <div id = "LeftBottom">
                    <p id = "DetailParameterText">Tags</p>
                    <div class="ExtTags">
                        ${CreateTags(tags,`id=ExtTaskTag1`,`id=ExtTaskTag2`,`id=ExtTaskTag3`)}
                    </div>
                </div>
                <div id = "RightBottom">
                    <p id = "DetailParameterText">Story Points</p>
                    <div id = "DetailValue">
                        ${storyPoints}
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="show-history-log" onclick="showHistoryLog('${taskName}')">
                    <i class="fa fa-history"></i> Show History Log
                </button>
                <button class="edit-task" onclick="openEditTaskForm('${taskName}')">
                    <i class="far fa-edit"></i> Edit
                </button>
                <button class="DeleteButton" onclick="openDeleteConfirmationPopUp()">
                    <i class="far fa-trash-alt"></i> Delete
                </button>
            </div>
        <div class = "delete-popup" id = "deletePopUp">
            <h2>Are you sure?</h2>
            <p>Do you really want to delete this task? This action cannot be undone.</p>
            <div class = "delete-buttons">
            <button type = "button" class = "cancel" onclick="closeDeleteConfirmationPopUp()">Cancel</button>
            <button type = "button" class = "delete" onclick="deleteTaskCard('${taskName}','${data_taskName}')">Delete</button>
            </div>
        </div>
    </div>`;
    
    // This is for prefilling the edit pop up
    taskNames.push(taskName);

    // Show the detailed view of the task card
    document.getElementById('task-details-popup').style.display = 'block';
    showOverlay();
}

// Function to close the detailed view of the task card by clicking on the x button
function closeDetailedTaskCard() {
    document.getElementById('task-details-popup').style.display = 'none';
    hideOverlay();
}

// Function to delete a task card
function deleteTaskCard(taskName,UITaskName) {
    console.log(UITaskName)
    const canvas = document.querySelector('.canvas');
    // Delete task from Firebase
    const db=firebase.database().ref('taskCard/' + taskName)
    db.remove()
    .then(() => {
        // Now loop through all task cards and hide the deleted one
        const taskCards = Array.from(document.querySelectorAll('.task-card'));    
        taskCards.forEach(card => {
            console.log(card.querySelector('#TaskHeader').textContent)
            if (card.querySelector('#TaskHeader').textContent === UITaskName) {
                canvas.removeChild(card)
            }
        });

        // Close the detailed view of the task card
        closeDetailedTaskCard();
    })
    .catch(error => {
        console.error("Error removing task: ", error);
    });
}

// Function to save the edits made to a task card
function saveEdits(taskName) {

    // If no tags have been selected
    if (selectedTags['edit-tags'].length === 0) {
        alert('Please select at least one tag.');
        return;
    }

    const newTaskName = document.getElementById('edit-task-name').value;
    const taskDesc = document.getElementById('edit-task-desc').value;
    const priority = document.getElementById('edit-priority').value;
    const storyPoints = document.getElementById('edit-story-points').value;
    const tags = selectedTags['edit-tags'];
    const type = document.getElementById('edit-Type').value;
    const status = document.getElementById('edit-status').value;

    // Update the values
    firebase.database().ref('taskCard/' + taskName).update({
        taskName: newTaskName,
        taskDesc: taskDesc,
        priority: priority,
        storyPoints: storyPoints,
        tags: tags,
        type: type,
        status: status
    });

    // Update the history log of the task card
    firebase.database().ref('taskCard/' + taskName + '/log').push().set({
        user: 'admin',
        date: new Date().toString().slice(0,21).replace(/-/g,""),
        action: 'edited'
    });

    const canvas = document.querySelector('.canvas');
    // remove all children from canvas
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    //Then add them all back in based on whats in the database
    reloadTaskCards();
    
    // Close the form
    closeEditTaskForm();
    closeDetailedTaskCard();

    // Clear the selected tags
    selectedTags['edit-tags'] = [];
}

// Function to reload task cards
function reloadTaskCards() {
    var user_ref = firebase.database().ref('taskCard')
    user_ref.once('value', function(snapshot){ // make sure to use once instead of on to read data once so no duplicates of data
        var data = snapshot.val()
        for (var key in data){
            addTaskCard(key)
        }
    })
}

/**
 * Filters tasks by tags.
 * @param {string} tag - The tag to filter tasks by.
 */
function filterTasks(tag) {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        let tags = card.dataset.tags;

        // Check if tags is a string or an array
        if (typeof tags === 'string') {
            tags = tags.split(','); // Convert comma-separated string to array
        }

        // Check if the tag is in the array of tags
        if (tag === '' || tags.includes(tag)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Sorts tasks based on the given criteria.
 * @param {string} criteria - The criteria to sort tasks by.
 */
function sortTasks(criteria) {
    const canvas = document.querySelector('.canvas');
    const taskCards = Array.from(document.querySelectorAll('.task-card'));

    taskCards.sort((a, b) => {
        if (criteria === 'date-asc') {
            return new Date(a.dataset.date) - new Date(b.dataset.date);
        } else if (criteria === 'date-desc') {
            return new Date(b.dataset.date) - new Date(a.dataset.date);
        } else if (criteria === 'priority-asc') {
            return getPriorityValue(a.dataset.priority) - getPriorityValue(b.dataset.priority);
        } else if (criteria === 'priority-desc') {
            return getPriorityValue(b.dataset.priority) - getPriorityValue(a.dataset.priority);
        }
    });

    taskCards.forEach(card => canvas.appendChild(card));
}

/**
 * Helper function to get the priority value.
 * @param {string} priority - The priority level.
 * @returns {number} - The numerical value of the priority.
 */
function getPriorityValue(priority) {
    const priorities = {
        'Low': 1,
        'Medium': 2,
        'Important': 3,
        'Urgent': 4
    };
    return priorities[priority] || 0;
}

function showHistoryLog(taskName) {
    // Display the history log popup
    document.getElementById('task-details-popup').style.display = 'block';

    // Get the date and user info from database
    var log_ref = firebase.database().ref('taskCard/' + taskName + '/log');
    
    // Fetch the data
    log_ref.once('value', function(snapshot) {
        var data = snapshot.val();
        var historyLogHtml = '<div class="history-log-container"><ol class="relative border-s border-gray-200 dark:border-gray-700">'; 
        
        // Convert the data object to an array of keys
        var keys = Object.keys(data);

        // Reverse the array of keys
        keys.reverse();

        // Iterate over the reversed array of keys
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var logEntry = data[key];
            // Generate HTML for each log entry
            historyLogHtml += `
                <li class="mb-10 ms-6">
                    <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900"></span>
                    <div class="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:bg-gray-700 dark:border-gray-600">
                        <time class="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">${logEntry.date}</time>
                        <div class="text-sm font-normal text-gray-500 dark:text-gray-300">${logEntry.user} ${logEntry.action} task on</div>
                    </div>
                </li>`;
        }
        
        historyLogHtml += '</ol></div>';
        
        // Display the history log
        document.getElementById('task-details-content').innerHTML = historyLogHtml;
    });
}
