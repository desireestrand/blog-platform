// ----- DATUMFORMATERING -----
function getCurrentDateTime() {
    const currentDate = new Date()
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const year = currentDate.getFullYear()
    const hours = String(currentDate.getHours()).padStart(2, '0')
    const minutes = String(currentDate.getMinutes()).padStart(2, '0')

    return `• ${day}-${month}-${year} @ ${hours}:${minutes}`
}

// ----- LAGRING -----
function getPostsFromStorage() {
    try {
        const posts = localStorage.getItem('posts')
        const parsed = posts ? JSON.parse(posts) : []
        return Array.isArray(parsed) ? parsed : []
    } catch (e) {
        console.error('Fel i localStorage, rensar:', e)
        return []
    }
}

function savePostsToStorage(posts) {
    localStorage.setItem('posts', JSON.stringify(posts))
}

// ----- DOM-ELEMENT -----
const author = document.getElementById('fauthor')
const title = document.getElementById('ftitle')
const content = document.getElementById('fcontent')
const postForm = document.getElementById('new-post-form')
const postHolder = document.getElementById('posts')

// Meddelande om inga inlägg
const emptyMessage = document.createElement('p')
emptyMessage.textContent = 'Inga inlägg än...'
emptyMessage.id = 'empty-message'
postHolder.appendChild(emptyMessage)

function updateEmptyMessage() {
    if (postHolder.querySelectorAll('article').length === 0) {
        emptyMessage.style.display = 'block'
    } else {
        emptyMessage.style.display = 'none'
    }
}

// ----- SKAPA INLÄGG -----
postForm.addEventListener('submit', (e) => {
    e.preventDefault()

    newPost(author.value, title.value, content.value)

    author.value = ''
    title.value = ''
    content.value = ''
})

// Skapar ett nytt inlägg utifrån formuläret
function newPost(authorText, titleText, contentText) {
    // Array med inläggsinformation som sparas i localStorage
    const post = {
        id: Date.now().toString(),
        author: authorText,
        title: titleText,
        content: contentText,
        likes: 0,
        dislikes: 0,
        date: getCurrentDateTime(),
        comments: []
    }

    const posts = getPostsFromStorage()
    posts.push(post)
    savePostsToStorage(posts)

    renderPost(post)
    updateEmptyMessage()
}

// ----- VISA INLÄGG -----
function renderPost(postData) {
    const article = document.createElement('article')
    article.dataset.id = postData.id

    // Titel
    const postTitle = document.createElement('h3')
    postTitle.textContent = postData.title
    article.appendChild(postTitle)

    // Författare
    const postAuthor = document.createElement('p')
    postAuthor.textContent = `Av ${postData.author}`
    postAuthor.classList.add('post-meta')
    article.appendChild(postAuthor)

    // Datum
    const postDate = document.createElement('time')
    postDate.textContent = postData.date
    postAuthor.appendChild(postDate)

    // Innehåll
    const postContent = document.createElement('p')
    postContent.textContent = postData.content
    postContent.classList.add('post-content')
    article.appendChild(postContent)

    // Reaktioner (like/dislike)
    const reactionSection = renderReactions(postData)
    article.appendChild(reactionSection)

    // Ta bort inlägg
    const postRemoveButton = document.createElement('button')
    postRemoveButton.textContent = 'Ta bort inlägg'
    postRemoveButton.classList.add('remove-button')
    postRemoveButton.addEventListener('click', () => {
        const confirmDeletePost = confirm('Är du säker på att du vill ta bort det här inlägget?')
        if (confirmDeletePost) {
            article.remove()
            const posts = getPostsFromStorage().filter((post) => post.id !== postData.id)
            savePostsToStorage(posts)
            updateEmptyMessage()
        }
    })
    article.appendChild(postRemoveButton)

    // Kommentarer
    const commentSection = renderCommentSection(postData)
    article.appendChild(commentSection)

    postHolder.prepend(article)
}

// ----- REAKTIONER (LIKE/DISLIKE) -----
function renderReactions(postData) {
    const reactionSection = document.createElement('div')
    reactionSection.classList.add('reactions')

    // Like
    const likeButton = document.createElement('button')
    likeButton.textContent = '❤️ '
    let likeCount = postData.likes
    const likeCounter = document.createElement('span')
    likeCounter.textContent = likeCount
    likeButton.appendChild(likeCounter)

    // Dislike
    const dislikeButton = document.createElement('button')
    dislikeButton.textContent = '👎 '
    let dislikeCount = postData.dislikes
    const dislikeCounter = document.createElement('span')
    dislikeCounter.textContent = dislikeCount
    dislikeButton.appendChild(dislikeCounter)

    // Kollar om användaren har gillat inlägget den här sessionen, då kan användaren inte ogilla inlägget - och tvärtom
    let liked = false
    let disliked = false

    likeButton.addEventListener('click', () => {
        if (!liked) {
            likeCount++
            likeCounter.textContent = likeCount
            liked = true
            dislikeButton.disabled = true
            likeButton.classList.add('selected')
            dislikeButton.classList.add('disabled')
        } else {
            likeCount--
            likeCounter.textContent = likeCount
            liked = false
            dislikeButton.disabled = false
            likeButton.classList.remove('selected')
            dislikeButton.classList.remove('disabled')
        }

        const posts = getPostsFromStorage()
        const thisPost = posts.find((post) => post.id === postData.id)
        thisPost.likes = likeCount
        savePostsToStorage(posts)
    })

    dislikeButton.addEventListener('click', () => {
        if (!disliked) {
            dislikeCount++
            dislikeCounter.textContent = dislikeCount
            disliked = true
            likeButton.disabled = true
            dislikeButton.classList.add('selected')
            likeButton.classList.add('disabled')
        } else {
            dislikeCount--
            dislikeCounter.textContent = dislikeCount
            disliked = false
            likeButton.disabled = false
            dislikeButton.classList.remove('selected')
            likeButton.classList.remove('disabled')
        }

        const posts = getPostsFromStorage()
        const thisPost = posts.find((post) => post.id === postData.id)
        thisPost.dislikes = dislikeCount
        savePostsToStorage(posts)
    })

    reactionSection.appendChild(likeButton)
    reactionSection.appendChild(dislikeButton)
    return reactionSection
}

// ----- KOMMENTARSEKTIONEN -----
function renderCommentSection(postData) {
    const commentSection = document.createElement('div')
    commentSection.classList.add('comment-section')

    const commentTitle = document.createElement('h4')
    commentTitle.textContent = `Kommentarer (${postData.comments.length})`
    commentSection.appendChild(commentTitle)

    const commentList = document.createElement('div')
    commentList.classList.add('comment-list')
    commentSection.appendChild(commentList)

    // Visa befintliga kommentarer
    postData.comments.forEach((comment) => renderComment(comment, commentList, commentTitle, postData.id))

    // Kommentarformulär
    const commentFormTitle = document.createElement('h4')
    commentFormTitle.textContent = 'Skriv en kommentar'
    commentFormTitle.id = 'comment-form-title'
    commentSection.appendChild(commentFormTitle)

    const commentForm = document.createElement('form')
    commentForm.classList.add('comment-form')

    const nameGroup = document.createElement('div')
    nameGroup.classList.add('input-group')

    const labelCommenterName = document.createElement('label')
    labelCommenterName.setAttribute('for', 'commenter')
    labelCommenterName.textContent = 'Namn'
    nameGroup.appendChild(labelCommenterName)

    const inputCommenterName = document.createElement('input')
    inputCommenterName.type = 'text'
    inputCommenterName.id = 'commenter'
    inputCommenterName.classList.add('fcommenter')
    inputCommenterName.name = 'fcommenter'
    inputCommenterName.required = true
    nameGroup.appendChild(inputCommenterName)

    commentForm.appendChild(nameGroup)

    const commentGroup = document.createElement('div')
    commentGroup.classList.add('input-group')

    const labelComment = document.createElement('label')
    labelComment.setAttribute('for', 'comment')
    labelComment.textContent = `Kommentar`
    commentGroup.appendChild(labelComment)

    const commentTextarea = document.createElement('textarea')
    commentTextarea.id = 'comment'
    commentTextarea.classList.add('fcomment')
    commentTextarea.name = 'fcomment'
    commentTextarea.required = true
    commentGroup.appendChild(commentTextarea)

    commentForm.appendChild(commentGroup)

    const commentSubmit = document.createElement('input')
    commentSubmit.type = 'submit'
    commentSubmit.value = 'Kommentera'
    commentSubmit.id = 'comment-btn'
    commentForm.appendChild(commentSubmit)

    // Skapa kommentar
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const commenter = inputCommenterName.value
        const comment = commentTextarea.value

        const newComment = {
            id: Date.now().toString(),
            commenter: commenter,
            comment: comment,
            date: getCurrentDateTime()
        }

        renderComment(newComment, commentList, commentTitle, postData.id)

        const posts = getPostsFromStorage()
        const thisPost = posts.find((post) => post.id === postData.id)
        if (thisPost) {
            thisPost.comments.push(newComment)
            savePostsToStorage(posts)
        }

        inputCommenterName.value = ''
        commentTextarea.value = ''
        updateCommentCount(commentList, commentTitle)
    }) 

    commentSection.appendChild(commentForm)
    return commentSection
}

// ----- ENSKILDA KOMMENTARER -----
function renderComment (c, commentList, commentTitle, postId) { 
    const comment = document.createElement('div')
    comment.classList.add('comment')

    // Författare
    const commenter = document.createElement('h5')
    commenter.textContent = c.commenter
    comment.appendChild(commenter)

    // Datum
    const commentDate = document.createElement('time')
    commentDate.textContent = c.date
    commentDate.classList.add('comment-meta')
    comment.appendChild(commentDate)

    // Ta bort kommentar
    const commentRemoveButton = document.createElement('button')
    commentRemoveButton.textContent = 'Ta bort kommentar'
    commentRemoveButton.addEventListener('click', () => {
        const confirmDeleteComment = confirm('Är du säker på att du vill ta bort den här kommentaren?')
        if (confirmDeleteComment) {
            comment.remove()

            const posts = getPostsFromStorage()
            const thisPost = posts.find((post) => post.id === postId)
            if (thisPost) {
                thisPost.comments = thisPost.comments.filter(cm => cm.id !== c.id)
                savePostsToStorage(posts)
            }
            updateCommentCount(commentList, commentTitle)
        }
    })
    comment.appendChild(commentRemoveButton)

    // Innehåll
    const commentContent = document.createElement('p')
    commentContent.textContent = c.comment
    comment.appendChild(commentContent)

    commentList.prepend(comment)
    updateCommentCount(commentList, commentTitle)
}

// Visa antalet kommentarer
function updateCommentCount(commentList, commentTitle) {
    const count = commentList.querySelectorAll('.comment').length
    commentTitle.textContent = `Kommentarer (${count})`
}

// Skapa inlägg från localStorage när sidan laddas
window.addEventListener('DOMContentLoaded', () => {
    const savedPosts = getPostsFromStorage() || []
    savedPosts.forEach((post) => renderPost(post))
    updateEmptyMessage()
})