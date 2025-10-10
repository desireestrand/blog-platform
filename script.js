const author = document.getElementById('fauthor')
const title = document.getElementById('ftitle')
const content = document.getElementById('fcontent')
const postForm = document.getElementById('new-post-form')
const postHolder = document.getElementById('posts')

postForm.addEventListener('submit', (e) => {
    e.preventDefault()

    newPost(author.value, title.value, content.value)

    author.value = ''
    title.value = ''
    content.value = ''
})

function newPost (authorText, titleText, contentText) {
    // Skapar article till postcontent - en funktion
    const article = document.createElement('article')

    const postTitle = document.createElement('h3')
    postTitle.textContent = titleText
    article.appendChild(postTitle)

    const postAuthor = document.createElement('p')
    postAuthor.textContent = `Av ${authorText}`
    postAuthor.classList.add('post-meta')
    article.appendChild(postAuthor)

    // Datumformatering - en funktion
    const currentDate = new Date()
    const datetime = "• " + currentDate.getDate() + "-" + (currentDate.getMonth()+1) + "-" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes()
    const postDate = document.createElement('time')
    postDate.textContent = datetime
    postAuthor.appendChild(postDate)

    const postContent = document.createElement('p')
    postContent.textContent = contentText
    postContent.classList.add('post-content')
    article.appendChild(postContent)

    // Reactions - en funktion
    const reactionSection = document.createElement('div')
    reactionSection.classList.add('reactions')

    const likeButton = document.createElement('button')
    likeButton.textContent = '❤️ '
    let likeCount = 0
    const likeCounter = document.createElement('span')
    likeCounter.textContent = `${likeCount}`
    likeButton.appendChild(likeCounter)

    const dislikeButton = document.createElement('button')
    dislikeButton.textContent = '👎 '
    let dislikeCount = 0
    const dislikeCounter = document.createElement('span')
    dislikeCounter.textContent = `${dislikeCount}`
    dislikeButton.appendChild(dislikeCounter)

    let liked = false
    let disliked = false

    likeButton.addEventListener('click', () => {
        if (!liked) {
            likeCount++
            likeCounter.textContent = `${likeCount}`
            liked = true
            dislikeButton.disabled = true
            likeButton.classList.add('selected')
            dislikeButton.classList.add('disabled')
        } else {
            likeCount--
            likeCounter.textContent = `${likeCount}`
            liked = false
            dislikeButton.disabled = false
            likeButton.classList.remove('selected')
            dislikeButton.classList.remove('disabled')
        }
    })

    dislikeButton.addEventListener('click', () => {
        if (!disliked) {
            dislikeCount++
            dislikeCounter.textContent = `${dislikeCount}`
            disliked = true
            likeButton.disabled = true
            dislikeButton.classList.add('selected')
            likeButton.classList.add('disabled')
        } else {
            dislikeCount--
            dislikeCounter.textContent = `${dislikeCount}`
            disliked = false
            likeButton.disabled = false
            dislikeButton.classList.remove('selected')
            likeButton.classList.remove('disabled')
        }
    })

    reactionSection.appendChild(likeButton)
    reactionSection.appendChild(dislikeButton)

    article.appendChild(reactionSection)

    // Removebutton - en funktion
    const postRemoveButton = document.createElement('button')
    postRemoveButton.textContent = 'Ta bort inlägg'
    postRemoveButton.classList.add('remove-button')
    postRemoveButton.addEventListener('click', () => {
        const confirmDeletePost = confirm('Är du säker på att du vill ta bort det här inlägget?')
        if (confirmDeletePost) {
            article.remove()
        }
    })
    article.appendChild(postRemoveButton)

    // Kommentarer - en funktion
    const commentSection = document.createElement('div')
    commentSection.classList.add('comment-section')
    article.appendChild(commentSection)

    const commentTitle = document.createElement('h4')
    commentTitle.textContent = 'Kommentarer (0)'
    commentSection.appendChild(commentTitle)

    let commentCount = 0

    const commentList = document.createElement('div')
    commentList.classList.add('comment-list')
    commentSection.appendChild(commentList)

    const commentFormTitle = document.createElement('h4')
    commentFormTitle.textContent = 'Skriv en kommentar'
    commentFormTitle.id = 'comment-form-title'
    commentSection.appendChild(commentFormTitle)

    const commentForm = document.createElement('form')
    commentForm.classList.add('comment-form')
    commentSection.appendChild(commentForm)

    const labelCommenterName = document.createElement('label')
    labelCommenterName.setAttribute('for', 'commenter')
    labelCommenterName.textContent = 'Namn'
    commentForm.appendChild(labelCommenterName)

    const inputCommenterName = document.createElement('input')
    inputCommenterName.type = 'text'
    inputCommenterName.id = 'commenter'
    inputCommenterName.classList.add('fcommenter')
    inputCommenterName.name = 'fcommenter'
    inputCommenterName.required = true
    commentForm.appendChild(inputCommenterName)

    const labelComment = document.createElement('label')
    labelComment.setAttribute('for', 'comment')
    labelComment.textContent = `Kommentar`
    commentForm.appendChild(labelComment)

    const commentTextarea = document.createElement('textarea')
    commentTextarea.id = 'comment'
    commentTextarea.className = 'fcomment' // Ändra alla classlist till classname
    commentTextarea.name = 'fcomment'
    commentTextarea.required = true
    commentForm.appendChild(commentTextarea)

    const commentSubmit = document.createElement('input')
    commentSubmit.type = 'submit'
    commentSubmit.value = 'Kommentera'
    commentSubmit.id = 'comment-btn'
    commentForm.appendChild(commentSubmit)

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const commenter = commentForm.querySelector('.fcommenter')
        const comment = commentForm.querySelector('.fcomment')

        newComment(commenter.value, comment.value, commentList, commentTitle)

        commenter.value = ''
        comment.value = ''
    })

    postHolder.prepend(article)
}

function newComment (commenterText, commentText, commentList, commentTitle) { 
    const comment = document.createElement('div')
    comment.classList.add('comment')

    const commenter = document.createElement('h5')
    commenter.textContent = commenterText
    comment.appendChild(commenter)

    const currentDate = new Date()
    const datetime = "• " + currentDate.getDate() + "-" + (currentDate.getMonth()+1) + "-" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes()
    const commentDate = document.createElement('time')
    commentDate.textContent = datetime
    commentDate.classList.add('comment-meta')
    comment.appendChild(commentDate)

    const commentRemoveButton = document.createElement('button')
    commentRemoveButton.textContent = 'Ta bort kommentar'
    commentRemoveButton.addEventListener('click', () => {
        const confirmDeleteComment = confirm('Är du säker på att du vill ta bort den här kommentaren?')
        if (confirmDeleteComment) {
            comment.remove()
            updateCommentCount(commentList, commentTitle)
        }
    })
    comment.appendChild(commentRemoveButton)

    const commentContent = document.createElement('p')
    commentContent.textContent = commentText
    comment.appendChild(commentContent)

    commentList.prepend(comment)

    updateCommentCount(commentList, commentTitle)
}

function updateCommentCount(commentList, commentTitle) {
    const count = commentList.querySelectorAll('.comment').length
    commentTitle.textContent = `Kommentarer (${count})`
}