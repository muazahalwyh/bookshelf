let books =[];

const RENDER_EVENT = 'render_book';

const INCOMPLETE_BOOKSHELFLIST = 'incompleteBookshelfList';
const COMPLETE_BOOK_SHELFLIST = 'completeBookshelfList';
const BOOK_ITEMID = 'itemId';

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event){
        event.preventDefault();
        addBook();
    });

    const searchBooks = document.getElementById('searchBook');
    searchBooks.addEventListener('submit', function(event){
        event.preventDefault();
        searchBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function isStorageExist() { 
    if(typeof(Storage) === undefined){
        alert('Browser Anda Tidak Mendukung Local Storage');
        return false
    }
    return true;
}

function saveData(){
    const parsed =JSON.stringify(books);
    localStorage.setItem(RENDER_EVENT, parsed);
    document.dispatchEvent(new Event('ondatasaved'));
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(RENDER_EVENT);

    let data = JSON.parse(serializedData);

    if(data !== null)
        books = data;

    document.dispatchEvent(new Event('ondataloaded'));
}

function updateDataToStorage(){
    if (isStorageExist())
        saveData();
}

document.addEventListener('ondatasaved',()=>{
    console.log('Data Berhasil Disimpan');
});

document.addEventListener('ondataloaded',()=>{
    refreshDataFrombooks();
});

function addBook() { 
    const incompleteBookshelfList = document.getElementById(INCOMPLETE_BOOKSHELFLIST);
    const completeBookshelfList = document.getElementById(COMPLETE_BOOK_SHELFLIST);

    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const book = makeBook (inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    const bookObject = composebookObject(inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);

    book[BOOK_ITEMID] = bookObject.id;
    books.push(bookObject);

    if(inputBookIsComplete==false){
        incompleteBookshelfList.append(book);
    }else{
        completeBookshelfList.append(book);
    }

    updateDataToStorage();
}

function makeBook (inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete){
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = inputBookTitle;
    bookTitle.classList.add('move')

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = inputBookAuthor;

    const bookYears = document.createElement('p');
    bookYears.classList.add('year');
    bookYears.innerText = inputBookYear;

    const bookIsComplete = createCompleteButton();

    const bookRemove = createRemoveButton();
    bookRemove.innerText = 'Hapus';

    const bookAction = document.createElement('div');
    bookAction.classList.add('action');
    if (inputBookIsComplete == true){
        bookIsComplete.innerText = 'Belum Selesai';
    }else{
        bookIsComplete.innerText = 'Sudah Selesai';
    }

    bookAction.append(bookIsComplete, bookRemove);
    const bookItem = document.createElement('article');
    bookItem.classList.add('book_item');
    bookItem.append(bookTitle, bookAuthor, bookYears, bookAction);

    return bookItem;
};



function composebookObject(title, author, year, isCompleted) {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isCompleted
    };
}

function findbook(bookId) { 
    for(book of books){
        if(book.id === bookId)
            return book;
    }
    return null;
}

function findbookIndex(bookId){
    let index = 0
    for (book of books) {
        if(book.id === bookId)
            return index;

        index++;
    }
    return -1;
}

function changeText(){
    const checkbox = document.getElementById('inputBookIsComplete');
    const textSubmit = document.getElementById('textSubmit');

    if(checkbox.checked == true){
        textSubmit.innerText = 'Sudah Selesai Dibaca';
    }else{
        textSubmit.innerText = 'Belum Selesai Dibaca';
    }
};

function createButton (buttonTypeClass, eventListener){
    const button = document.createElement('button');
    button.classList.add(buttonTypeClass);
    button.addEventListener('click', function (event){
        eventListener(event);
    });
    return button;
};

function createCompleteButton(){
    return createButton('green', function(event){
        const parent = event.target.parentElement;
        addBookToCompleted(parent.parentElement);
    });
};

function createRemoveButton(){
    return createButton('red', function(event){
        const parent = event.target.parentElement;
        removeBook(parent.parentElement);
    });
};

function removeBook(bookElement){
    const bookPosition = findbookIndex(bookElement[BOOK_ITEMID]);
    if (window.confirm('Apakah Anda Ingin menghapus Buku Ini dari Rak?')){
        books.splice(bookPosition, 1);
        bookElement.remove();
    }
    updateDataToStorage();
};

function addBookToCompleted(bookElement){
    const bookTitled = bookElement.querySelector('.book_item > h3').innerText;
    const bookAuthored = bookElement.querySelector('.book_item > p').innerText;
    const bookYeared = bookElement.querySelector('.year').innerText;
    const bookIsComplete = bookElement.querySelector('.green').innerText;

    if (bookIsComplete == 'Sudah Selesai'){
        const newBook = makeBook(bookTitled, bookAuthored, bookYeared, true)

        const book = findbook(bookElement[BOOK_ITEMID]);
        book.isCompleted = true;
        newBook[BOOK_ITEMID] = book.id;

        const completeBookshelfList = document.getElementById(COMPLETE_BOOK_SHELFLIST);
        completeBookshelfList.append(newBook);
    }else{
        const newBook = makeBook(bookTitled, bookAuthored, bookYeared, false)
        
        const book = findbook(bookElement[BOOK_ITEMID]);
        book.isCompleted = false;
        newBook[BOOK_ITEMID] = book.id;

        const incompleteBookshelfList = document.getElementById(INCOMPLETE_BOOKSHELFLIST);
        incompleteBookshelfList.append(newBook);
    }
    bookElement.remove();

    updateDataToStorage();
};

function refreshDataFrombooks() { 
    const listUncompleted = document.getElementById(INCOMPLETE_BOOKSHELFLIST);
    const listCompleted = document.getElementById(COMPLETE_BOOK_SHELFLIST);

    for(book of books){
        const newbook = makeBook(book.title, book.author, book.year, book.isCompleted);
        newbook[BOOK_ITEMID] = book.id;

        if(book.isCompleted == false){
            listUncompleted.append(newbook);
        }else{
            listCompleted.append(newbook);
        }
    }
}

function searchBook(){
    const inputSearch = document.getElementById('searchBookTitle').value;
    const moveBook = document.querySelectorAll('.move')

    for(move of moveBook){
        if(inputSearch !== move.innerText){
            console.log(move.innerText)
            move.parentElement.remove();
        }
    }
}