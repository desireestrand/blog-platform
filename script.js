// ----- DATUMFORMATERING -----
// Returnerar aktuellt datum och tid i format: dd-mm-yyyy @ hh:mm
function getCurrentDateTime() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `• ${day}-${month}-${year} @ ${hours}:${minutes}`;
}

// ----- LAGRING -----
// Hämtar alla inlägg från localStorage, returnerar tom array om inga finns
function getPostsFromStorage() {
  try {
    const posts = localStorage.getItem("posts");
    const parsed = JSON.parse(posts || "[]");

    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      console.warn("Ogiltigt format i localStorage, förväntade array.");
      return [];
    }
  } catch {
    console.error("Fel vid inläsning av inlägg från localStorage. Återställer till tom lista.");
    return [];
  }
}

// Sparar inlägg-array till localStorage
function savePostsToStorage(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}

// ----- DOM-ELEMENT -----
// Referenser till formulär och container för inlägg
const postContainer = document.getElementById("posts");
const postForm = document.getElementById("new-post-form");
const authorInput = document.getElementById("fauthor");
const titleInput = document.getElementById("ftitle");
const contentInput = document.getElementById("fcontent");

// ----- TOMT MEDDELANDE -----
// Skapar meddelande om inga inlägg finns
function createEmptyMessageElement() {
  const emptyMessage = document.createElement("p");
  emptyMessage.id = "empty-message";
  emptyMessage.textContent = "Inga inlägg än...";

  postContainer.appendChild(emptyMessage);

  return emptyMessage;
}

// Visar eller döljer meddelandet beroende på om det finns inlägg
function updateEmptyMessage() {
  const emptyMessage = document.getElementById("empty-message");
  const hasPosts = postContainer.querySelectorAll("article").length > 0;

  if (hasPosts) {
    emptyMessage.style.display = "none";
  } else {
    emptyMessage.style.display = "block";
  }
}

// ----- INLÄGGSHANTERING -----
// Hanterar formulär-submit och skapar nytt inlägg
function handlePostFormSubmit(e) {
  e.preventDefault(); // Förhindra sida att ladda om

  const newPost = createPost(authorInput.value, titleInput.value, contentInput.value);
  renderPost(newPost);

  // Tömmer formulär efter publicering
  authorInput.value = "";
  titleInput.value = "";
  contentInput.value = "";
  updateEmptyMessage();
}

// Skapar ett nytt inläggsobjekt och sparar det i localStorage
function createPost(author, title, content) {
  const post = {
    id: Date.now().toString(), // Unikt ID baserat på tid
    author: author,
    title: title,
    content: content,
    likes: 0,
    dislikes: 0,
    date: getCurrentDateTime(),
    comments: [],
  };

  const posts = getPostsFromStorage();
  posts.push(post);
  savePostsToStorage(posts);

  return post;
}

// Renderar ett inlägg i DOM
function renderPost(post) {
  const article = document.createElement("article");
  article.dataset.id = post.id;

  // Titel
  const postTitle = document.createElement("h3");
  postTitle.textContent = post.title;
  article.appendChild(postTitle);

  // Författare
  const postAuthor = document.createElement("p");
  postAuthor.classList.add("post-meta");
  postAuthor.textContent = `Av ${post.author}`;
  article.appendChild(postAuthor);

  // Datum
  const postDate = document.createElement("time");
  postDate.textContent = post.date;
  postAuthor.appendChild(postDate);

  // Innehåll
  const postContent = document.createElement("p");
  postContent.classList.add("post-content");
  postContent.textContent = post.content;
  article.appendChild(postContent);

  // Reaktioner (like/dislike)
  article.appendChild(createReactionSection(post));

  // Ta bort-knapp
  article.appendChild(createRemovePostButton(post.id, article));

  // Kommentarer
  article.appendChild(createCommentSection(post));

  // Lägg inlägget överst
  postContainer.prepend(article);
  updateEmptyMessage();
}

// Skapar ta-bort-knapp för inlägg
function createRemovePostButton(postId, article) {
  const removePostButton = document.createElement("button");
  removePostButton.classList.add("remove-button");
  removePostButton.classList.add("btn-danger");
  removePostButton.textContent = "Ta bort inlägg";

  removePostButton.addEventListener("click", () =>
    deletePostFromStorage(postId, article)
  );

  return removePostButton;
}

// Tar bort inlägg från DOM och localStorage med bekräftelse
function deletePostFromStorage(postId, article) {
  const confirmDeletePost = confirm("Är du säker på att du vill ta bort det här inlägget?");

  if (confirmDeletePost) {
    article.remove();
    const posts = getPostsFromStorage().filter((p) => p.id !== postId);
    savePostsToStorage(posts);
    updateEmptyMessage();
  }
}

// ----- REAKTIONER (LIKE/DISLIKE) -----
// Skapar sektion med like- och dislike-knappar
function createReactionSection(post) {
  const reactionSection = document.createElement("div");
  reactionSection.classList.add("reactions");

  // Like
  const likeButton = document.createElement("button");
  likeButton.classList.add("btn-primary");
  likeButton.textContent = `❤️ ${post.likes}`;
  likeButton.dataset.liked = "false";

  // Dislike
  const dislikeButton = document.createElement("button");
  dislikeButton.classList.add("btn-primary");
  dislikeButton.textContent = `👎 ${post.dislikes}`;
  dislikeButton.dataset.liked = "false";

  // Event listeners
  likeButton.addEventListener("click", () => handlePostReaction(post.id, "like", likeButton, dislikeButton));
  dislikeButton.addEventListener("click", () => handlePostReaction(post.id, "dislike", likeButton, dislikeButton));

  reactionSection.appendChild(likeButton);
  reactionSection.appendChild(dislikeButton);

  return reactionSection;
}

// Hanterar like/dislike logik
function handlePostReaction(postId, type, likeButton, dislikeButton) {
  const posts = getPostsFromStorage();
  const thisPost = posts.find((p) => p.id === postId);

  let liked = likeButton.dataset.liked === "true";
  let disliked = dislikeButton.dataset.liked === "true";

  if (type === "like") {
    if (!liked) {
      thisPost.likes++;
      likeButton.dataset.liked = "true";
      dislikeButton.dataset.liked = "false";
      dislikeButton.disabled = true;
      likeButton.classList.add("selected");
      dislikeButton.classList.add("disabled");
    } else {
      thisPost.likes--;
      likeButton.dataset.liked = "false";
      dislikeButton.disabled = false;
      likeButton.classList.remove("selected");
      dislikeButton.classList.remove("disabled");
    }
  } else if (type === "dislike") {
    if (!disliked) {
      thisPost.dislikes++;
      dislikeButton.dataset.liked = "true";
      likeButton.dataset.liked = "false";
      likeButton.disabled = true;
      dislikeButton.classList.add("selected");
      likeButton.classList.add("disabled");
    } else {
      thisPost.dislikes--;
      dislikeButton.dataset.liked = "false";
      likeButton.disabled = false;
      dislikeButton.classList.remove("selected");
      likeButton.classList.remove("disabled");
    }
  }

  // Uppdatera knapptext och spara
  likeButton.textContent = `❤️ ${thisPost.likes}`;
  dislikeButton.textContent = `👎 ${thisPost.dislikes}`;

  savePostsToStorage(posts);
}

// ----- KOMMENTARER -----
// Skapar hela kommentarssektionen för ett inlägg
function createCommentSection(post) {
  const commentSection = document.createElement("div");
  commentSection.classList.add("comment-section");

  // Titel med antal kommentarer
  const commentTitle = document.createElement("h4");
  commentTitle.textContent = `Kommentarer (${post.comments.length})`;
  commentSection.appendChild(commentTitle);

  const commentList = document.createElement("div");
  commentList.classList.add("comment-list");
  commentSection.appendChild(commentList);

  // Rendera befintliga kommentarer
  post.comments.forEach((c) => renderComment(c, commentList, commentTitle, post.id));

  // Lägg till kommentarsformulär
  commentSection.appendChild(createCommentForm(post, commentList, commentTitle));

  return commentSection;
}

// Renderar en enskild kommentar
function renderComment(comment, commentList, commentTitle, postId) {
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");

  // Författare
  const commenter = document.createElement("h5");
  commenter.textContent = comment.commenter;
  commentElement.appendChild(commenter);

  // Datum
  const commentDate = document.createElement("time");
  commentDate.classList.add("comment-meta");
  commentDate.textContent = comment.date;
  commentElement.appendChild(commentDate);

  // Ta bort-knapp för kommentar
  const removeCommentButton = document.createElement("button");
  removeCommentButton.textContent = "Ta bort kommentar";
  removeCommentButton.classList.add("btn-danger");
  removeCommentButton.addEventListener("click", () => deleteCommentFromPost(postId, comment.id, commentElement, commentList, commentTitle));
  commentElement.appendChild(removeCommentButton);

  // Innehåll
  const commentContent = document.createElement("p");
  commentContent.textContent = comment.comment;
  commentElement.appendChild(commentContent);

  commentList.prepend(commentElement);
  updateCommentCount(commentList, commentTitle);
}

// Skapar formulär för att lägga till ny kommentar
function createCommentForm(post, commentList, commentTitle) {
  const commentFormContainer = document.createElement("div");

  const commentFormTitle = document.createElement("h4");
  commentFormTitle.textContent = "Skriv en kommentar";
  commentFormTitle.id = "comment-form-title";
  commentFormContainer.appendChild(commentFormTitle);

  const commentForm = document.createElement("form");
  commentForm.classList.add("comment-form");

  // Namn
  const nameGroup = document.createElement("div");
  nameGroup.classList.add("input-group");

  const nameLabel = document.createElement("label");
  nameLabel.setAttribute("for", `commenter-${post.id}`);
  nameLabel.textContent = "Namn";
  nameGroup.appendChild(nameLabel);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = `commenter-${post.id}`;
  nameInput.required = true;
  nameInput.placeholder = "Vad heter du, kommentatorn?";
  nameInput.classList.add("fcommenter");
  nameGroup.appendChild(nameInput);

  commentForm.appendChild(nameGroup);

  // Kommentar
  const commentGroup = document.createElement("div");
  commentGroup.classList.add("input-group");

  const commentLabel = document.createElement("label");
  commentLabel.setAttribute("for", `comment-${post.id}`);
  commentLabel.textContent = `Kommentar (max 250 tecken)`;
  commentGroup.appendChild(commentLabel);

  const commentTextarea = document.createElement("textarea");
  commentTextarea.id = `comment-${post.id}`;
  commentTextarea.required = true;
  commentTextarea.placeholder = "Vad tänker du om detta?";
  commentTextarea.maxLength = "250";
  commentTextarea.classList.add("fcomment");
  commentGroup.appendChild(commentTextarea);

  commentForm.appendChild(commentGroup);

  // Kommentar-submit-knapp
  const commentSubmit = document.createElement("input");
  commentSubmit.type = "submit";
  commentSubmit.value = "Kommentera";
  commentSubmit.id = "comment-btn";
  commentSubmit.classList.add("btn-primary");
  commentForm.appendChild(commentSubmit);

  // Hantera kommentar-submit
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    addCommentToPost(post.id, nameInput.value, commentTextarea.value, commentList, commentTitle);

    nameInput.value = "";
    commentTextarea.value = "";
  });

  commentFormContainer.appendChild(commentForm);

  return commentFormContainer;
}

// Lägger till ny kommentar i post och localStorage
function addCommentToPost(postId, commenter, comment, commentList, commentTitle) {
  const newComment = {
    id: Date.now().toString(),
    commenter: commenter,
    comment: comment,
    date: getCurrentDateTime(),
  };

  const posts = getPostsFromStorage();
  const thisPost = posts.find((p) => p.id === postId);

  if (thisPost) {
    thisPost.comments.push(newComment);
    savePostsToStorage(posts);
  }

  renderComment(newComment, commentList, commentTitle, postId);
}

// Tar bort kommentar från post och localStorage
function deleteCommentFromPost(postId, commentId, comment, commentList, commentTitle) {
  const confirmDeleteComment = confirm("Är du säker på att du vill ta bort den här kommentaren?");

  if (confirmDeleteComment) {
    const posts = getPostsFromStorage();
    const thisPost = posts.find(p => p.id === postId);

    if (thisPost) {
      thisPost.comments = thisPost.comments.filter((cm) => cm.id !== commentId);
      savePostsToStorage(posts);
    }

    comment.remove();

    updateCommentCount(commentList, commentTitle);
  }
}

// Uppdaterar antalet kommentarer
function updateCommentCount(commentList, commentTitle) {
  const count = commentList.querySelectorAll(".comment").length;
  commentTitle.textContent = `Kommentarer (${count})`;
}

// ----- INITIERING AV SIDAN -----
// Initierar sidan vid laddning
function init() {
  createEmptyMessageElement();

  const savedPosts = getPostsFromStorage() || [];
  savedPosts.forEach(renderPost);

  updateEmptyMessage();

  postForm.addEventListener("submit", handlePostFormSubmit);
}

// Kör init när DOM är klar
window.addEventListener("DOMContentLoaded", init);
