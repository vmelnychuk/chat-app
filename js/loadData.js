var UIConstants = UIConstants || {
    getElementStyle: function(elementId, propertyName) {
        var element = document.getElementById(elementId);
        var elementStyle = window.getComputedStyle(element);
        var propertyValue = elementStyle.getPropertyValue(propertyName);
        return parseInt(propertyValue, 10);
    }
}
UIConstants.userPaneMinWidth = UIConstants.getElementStyle("user-pane", "min-width");
UIConstants.historyPaneMinWidth = UIConstants.getElementStyle("history", "min-width");

var buildBasicUI = buildBasicUI || {
    buildUseList: function (users) {
        var userList = document.getElementById("users");
        var original = document.getElementById("user-item");
        for (var i = 0, len = users.length; i < len; i++) {
            var item = original.cloneNode(true);
            var userNameNode = item.firstElementChild;
            userNameNode.innerHTML = users[i].userName;
            item.setAttribute("id", "userId-"+users[i].userId);
            switch (users[i].userStatus) {
                case "online":
                    userNameNode.setAttribute("class", "online");
                    break;
                case "busy":
                    userNameNode.setAttribute("class", "busy");
                    break;
                case "away":
                    userNameNode.setAttribute("class", "away");
                    break;
                case "offline":
                    userNameNode.setAttribute("class", "offline");
                    break;
                default:
                    userNameNode.setAttribute("class", "online");
                    break;
            }
            userList.appendChild(item);
        }
    },
    showUserHistory: function(conversations, userId, userName) {
        var conversation = null;
        for (var i = 0, len = conversations.length; i < len; i++) {
            if (conversations[i].userId === userId) {
                conversation = conversations[i]["conversation"];
                break;
            }
        }
        var history = document.getElementById("history");
        var original = document.getElementById("message-item-template").firstElementChild;
        while (history.firstElementChild != history.lastElementChild) {
            history.removeChild(history.lastElementChild);
        }
        for (i = 0, len = conversation.length; i < len; i++) {
            messageItem = original.cloneNode(true);
            var mesgDate = new Date(conversation[i]["timestamp"]);
            var date =  mesgDate.getHours() + ":" + mesgDate.getMinutes() + ":" + mesgDate.getSeconds();
            messageItem.firstElementChild.firstElementChild.innerHTML = date;
            messageItem.firstElementChild.lastElementChild.setAttribute("class", conversation[i]["from"] === "me"?"from-me":"from-other");
            messageItem.firstElementChild.lastElementChild.innerHTML = conversation[i]["from"] === "me"?"me":userName;
            var message = conversation[i]["message"];
            if (message.join) {
                message = message.join(" ");
            }
            messageItem.lastElementChild.innerHTML = message;
            history.appendChild(messageItem);
        }
    },
    postMessage: function(text) {
        var history = document.getElementById("history");
        var original = document.getElementById("message-item-template").firstElementChild;
        var mesgDate = new Date();
        messageItem = original.cloneNode(true);
        var date =  mesgDate.getHours() + ":" + mesgDate.getMinutes() + ":" + mesgDate.getSeconds();
        messageItem.firstElementChild.firstElementChild.innerHTML = date;
        messageItem.firstElementChild.lastElementChild.setAttribute("class", "me");
        messageItem.firstElementChild.lastElementChild.innerHTML = "me";
        messageItem.lastElementChild.innerHTML = text;
        history.appendChild(messageItem);
    }
};

var store = store || {
    url: "js/store.json", /* path to json store file */
    data: {}, /* result of request */
    //httpRequest: new XMLHttpRequest(),
    httpRequest: (window.XMLHttpRequest)? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP"),
    makeRequest: function() {
        var self = this;
        this.httpRequest.open('GET', this.url, true);
        this.httpRequest.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                self.data = JSON.parse(this.responseText);
                buildBasicUI.buildUseList(store.data.users);      
            }   
        }
        this.httpRequest.send();
    },
};
store.makeRequest(store.url);

var eventsHelpers = eventsHelpers || {};
eventsHelpers.splitPane = document.getElementById("split-pane");
eventsHelpers.splitPane.onmousedown = function(e) {
    var mouseStartX = e.pageX;
    var userList = document.getElementById("user-list");
    var userPane = document.getElementById("user-pane");
    var startWidthUserList = userList.offsetWidth;
    var startWidthUserPane = userPane.offsetWidth;
    document.body.onselectstart = function() { return false };
    document.body.onmousedown = function() { return false };
    this.onmouseupHandler = function(e) {
        document.body.onmousedown = function() { return true };
        document.body.onselectstart = function() { return true };
        document.removeEventListener("mousemove", eventsHelpers.splitPane.onmousemoveHandler, false);
        document.removeEventListener("mouseup", eventsHelpers.splitPane.onmouseupHandler, false);

    };
    this.onmousemoveHandler = function(e) {
        var cursorMove = e.pageX - mouseStartX;

        if (startWidthUserList + cursorMove >= UIConstants.userPaneMinWidth && 
            startWidthUserList + cursorMove <= UIConstants.historyPaneMinWidth ) {
            userPane.style.width = startWidthUserPane + cursorMove + "px";
        userList.style.width = startWidthUserList + cursorMove + "px";
    }
}; 
document.addEventListener("mousemove", this.onmousemoveHandler, false);
document.addEventListener("mouseup", this.onmouseupHandler, false);
};

eventsHelpers.getEventTarget = function(e) {
    e = e || window.event;
    return e.target || e.srcElement;
}

eventsHelpers.userList = document.getElementById("users");
eventsHelpers.userList.addEventListener("click", function(e) {
    var target = eventsHelpers.getEventTarget(e);
    if (target && target.nodeName.toLowerCase() === "span") {
        var currentUserId = target.parentNode.id.split("-")[1];
        currentUserId = parseInt(currentUserId, 10);
        currentUserName = target.textContent;
        buildBasicUI.showUserHistory(store.data.conversations, currentUserId, currentUserName);
    }
});

eventsHelpers.sendMessage = document.getElementById("send-button");
eventsHelpers.sendMessage.addEventListener("click", function(e) {
    var text = document.getElementById("message-text").value;
    if (text) {
        buildBasicUI.postMessage(text);
        document.getElementById("message-text").value = "";
    }
});