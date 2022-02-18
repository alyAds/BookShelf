function toastActive(text) {
    const toast = document.querySelector(".toast");

    toast.innerText = text;
    toast.classList.add("active");
}

function disableButton(recycleBtn, returnBtn, readAction, always = false) {
    if (always == "disable") {
        recycleBtn.classList.add("disabled");
        returnBtn.classList.add("disabled");
        readAction.classList.add("disabled");
    } else if (always == "enable") {
        recycleBtn.classList.remove("disabled");
        returnBtn.classList.remove("disabled");
        readAction.classList.remove("disabled");
    } else {
        recycleBtn.classList.toggle("disabled");
        returnBtn.classList.toggle("disabled");
        readAction.classList.toggle("disabled");
    }
}

function hideToast(booleanName, toast, toastText) {
    if (booleanName) {
        return false;
    }

    booleanName = true;

    toastActive(toastText);

    setTimeout(() => {
        booleanName = false;
        toast.classList.remove("active");
    }, 3000);

    return false;
}

function updateCountBook() {
    const bookAtCollection = document.querySelector(".book-at-collection");
    const bookAtRead = document.querySelector(".book-at-read");

    const countBookAtCollection = bookAtCollection.children.length;
    const countBookAtRead = bookAtRead.children.length;

    bookAtCollection.setAttribute("data-count-book", countBookAtCollection);
    bookAtRead.setAttribute("data-count-book", countBookAtRead);
}

function selectBookCover(elem) {
    return (elem.classList.contains("book-cover")) ? elem : elem.parentElement;
}

function selectSortBtn(elem) {
    return (elem.hasAttribute("data-handle")) ? elem : elem.parentElement;
}

function updateAttributeBook(book, idDropBook) {
    if (book.parentElement.classList.contains("book-at-collection") ||
        book.parentElement.classList.contains("book-at-read")) {
        book.setAttribute("data-book-from", idDropBook);
    }
}

function changeReadActionText(readAction) {
    /*
        jika terdapat book pada table dan book berasal dari read 
        maka teks pada tombol primary table akan berubah menjadi Baca Kembali
        dan vice versa jika berasal dari collection
    */
    if (bookAtTable.children.length >= 1 && bookAtTable.children[0].getAttribute("data-book-from") == "book-at-read") {
        readAction.innerText = "Baca Kembali";
    } else if (bookAtTable.children.length >= 1 && bookAtTable.children[0].getAttribute("data-book-from") == "book-at-collection") {
        readAction.innerText = "Selesai Membaca";
    }
}

function sortBy(item) {
    // time adalah id, id terdapat dari +new Date()
    const items = {
        // item selanjutnya untuk tombol sort
        "time": "title",
        "title": "author",
        "author": "year",
        "year": "time"
    };

    return items[item];
}