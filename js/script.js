document.addEventListener('DOMContentLoaded', function () {
    const books = [];
    const RENDER_EVENT = 'render-books-list';
    const RENDER_EVENT_SEARCHED = 'render-searched-book'

    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();
    });

    const searchForm = document.getElementById('form-search');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.dispatchEvent(new Event(RENDER_EVENT_SEARCHED));
    });

    const renderAllBooks = document.getElementById('btn-renderAll');
    renderAllBooks.addEventListener('click',function(){
        document.dispatchEvent(new Event(RENDER_EVENT));
    })

    function isCompleteChecker(value) {
        if (value == 'true') {
            value = true;
            return value;
        } else {
            value = false;
            return value;
        }
    }

    function addTodo() {
        const textBook = document.getElementById('title').value;
        const authorBook = document.getElementById('writer').value;
        const yearBook = document.getElementById('year').value;
        const categoryBook = document.getElementById('category').value;
        const isComplete = isCompleteChecker(document.getElementById('keterangan').value);
        const generatedID = generateId();
        const todoObject = generateTodoObject(generatedID, textBook, authorBook, yearBook, categoryBook, isComplete); // fungsi (membuat objek)
        books.push(todoObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function generateId() {
        return +new Date();
    }

    function generateTodoObject(id, title, author, year, category, isCompleted) { 
        return {
            id,
            title,
            author,
            year,
            category,
            isCompleted
        }
    }

    document.addEventListener(RENDER_EVENT, function () {
        console.log(books);
        document.getElementById('searched').setAttribute('hidden','')
        const uncompletedContainer = document.getElementById('unread');
        uncompletedContainer.removeAttribute('hidden');
        const completedContainer = document.getElementById('read');
        completedContainer.removeAttribute('hidden');
        const uncompletedTODOList = document.getElementById('todos');
        uncompletedTODOList.innerHTML = '';
        const completedTODOList = document.getElementById('completed-todos');
        completedTODOList.innerHTML = '';

        for (const todoItem of books) {
            const todoElement = makeTodo(todoItem);
            if (!todoItem.isCompleted) { 
                uncompletedTODOList.append(todoElement); 
            } else { 
                completedTODOList.append(todoElement);
            }
        }
    });

    document.addEventListener(RENDER_EVENT_SEARCHED, function () {
        document.getElementById('searched').removeAttribute('hidden')
        const searchedTODOList = document.getElementById('searched-todos');
        searchedTODOList.innerHTML = '';
        const searchedBookTitle = document.getElementById('search').value.toLowerCase();
        const uncompletedContainer = document.getElementById('unread');
        uncompletedContainer.setAttribute('hidden', '')
        const completedContainer = document.getElementById('read');
        completedContainer.setAttribute('hidden', '')
        let notFound = true;
        for (const todoItem of books) {
            const todoElement = makeTodo(todoItem);
            const searchThis = todoItem.title.toLowerCase()
            if (searchThis.includes(searchedBookTitle)) {
                searchedTODOList.append(todoElement);
                notFound = false;
            }
        }
        if (notFound == true) {
            alert('Buku yang Anda cari tidak dapat ditemukan!!')
        }


    })


    function makeTodo(bookObject) {
        const textTitle = document.createElement('h2');
        textTitle.innerText = bookObject.title;

        const textAuthor = document.createElement('p');
        textAuthor.innerText = 'Penulis : ' + bookObject.author;

        const textYear = document.createElement('p');
        textYear.innerText = 'Tahun : ' + bookObject.year;

        const textCategory = document.createElement('p');
        textCategory.innerText = 'Kategori : ' + bookObject.category;

        const textContainer = document.createElement('div');
        textContainer.classList.add('inner');
        textContainer.append(textTitle, textAuthor, textYear, textCategory);

        const container = document.createElement('div');
        container.classList.add('item', 'shadow');
        container.append(textContainer); 
        container.setAttribute('id', `todo-${bookObject.id}`); 
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });
        const vertical = document.createElement('div');
        vertical.classList.add('vertical-btn');
 
        if (bookObject.isCompleted) { 
            const undoButton = document.createElement('button');
            undoButton.classList.add('undo-button');
            undoButton.addEventListener('click', function () {
                undoTaskFromCompleted(bookObject.id);
            });
            vertical.append(undoButton, trashButton);
        container.append(vertical);
            
        } else { 
            const checkButton = document.createElement('button');
            checkButton.classList.add('check-button');
            checkButton.addEventListener('click', function () {
                addTaskToCompleted(bookObject.id); 
            }); ;
            vertical.append(checkButton, trashButton);
            container.append(vertical);
        }
        return container; 
    }

    function addTaskToCompleted(todoId) {
        const todoTarget = findTodo(todoId); 
        if (todoTarget == null) return;
        todoTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT)); 
        saveData();
    }

    function undoTaskFromCompleted(todoId) { 
        const undoTarget = findTodo(todoId);
        if (undoTarget == null) return;
        undoTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function findTodo(todoId) { 
        for (const todoItem of books) { 
            if (todoItem.id === todoId) { 
                return todoItem;
            }
        } return null
    }

    function removeTaskFromCompleted(todoId) { 
        const todoDel = findTodoIndex(todoId);
        alert('Buku '+ books[todoDel].title +' sudah dihapus')
        books.splice(todoDel, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        
    }

    function findTodoIndex(todoId) {
        for (let index = 0; index < books.length; index++) {
            if (books[index].id === todoId) {
                return index;
            }
        }
    }

    const SAVED_EVENT = 'saved-todo';
    const STORAGE_KEY = 'TODO_APPS';

    function isStorageExist() {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const todo of data) {
                books.push(todo);
            }
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});