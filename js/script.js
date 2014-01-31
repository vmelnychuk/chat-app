/*var p = document.getElementById("text");
p.textContent = "hello";*/
function buildUseList(users) {
	var userList = document.getElementById("users");
	for (var i = 0, len = users.length; i < len; i++) {
		var item = document.createElement("li");
		item.innerHTML = users[i].userName;
		switch (users[i].userStatus) {
			case "online":
			item.setAttribute("class", "online");
			break;
			case "busy":
			item.setAttribute("class", "busy");
			break;
			case "away":
			item.setAttribute("class", "away");
			break;
			case "offline":
			item.setAttribute("class", "offline");
			break;
			default:
			item.setAttribute("class", "online");
			break;
		}
		userList.appendChild(item);
	}
}