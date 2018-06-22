import { Meteor } from 'meteor/meteor';
import '../both/dbconnect'
import '../both/routers';


Meteor.publish('lists', function(){
	console.log('list is published');
	var currentUser = this.userId;
	return Lists.find({ createdBy: currentUser });
});

Meteor.publish('todos', function(currentList){
	var currentUser = this.userId;
	return Todos.find({ createdBy: currentUser, listId : currentList })
});

Meteor.startup(() => {
  // code to run on server at startup
  console.log('startup of main.js of server');
});

Meteor.methods({
	'createNewList': function(listName){
		var currentUser = Meteor.userId();
		check(listName, String);
		if(listName == ""){
			listName = defaultName(currentUser);
		}
		var data = {
			name: listName,
			createdBy: currentUser
		}
		if(!currentUser){
			throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		}
		Lists.insert(data);
	},

	'createListItem': function(todoName, currentList){
		check(todoName, String);
		check(currentList, String);
		var currentUser = Meteor.userId();
		var data = {
			name: todoName,
			completed: false,
			createdAt: new Date(),
			createdBy: currentUser,
			listId: currentList
		}
		if(!currentUser){
			throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		}
		var currentList = Lists.findOne(currentList);
		if(currentList.createdBy != currentUser){
			throw new Meteor.Error("invalid-user", "You don't own that list.");
		}
		return Todos.insert(data);
	},

	'updateListItem': function(documentId, todoItem){
		check(todoItem, String);
		var currentUser = Meteor.userId();
		var data = {
			_id: documentId,
			createdBy: currentUser
		}
		if(!currentUser){
			throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		}
		Todos.update(data, {$set: { name: todoItem }});
	},

	'changeItemStatus': function(documentId, status){
		check(status, Boolean);
		var currentUser = Meteor.userId();
		var data = {
			_id: documentId,
			createdBy: currentUser
		}
		if(!currentUser){
			throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		}
		Todos.update(data, {$set: { completed: status }});
	},

	'removeListItem': function(documentId){
		var currentUser = Meteor.userId();
		var data = {
			_id: documentId,
			createdBy: currentUser
		}
		if(!currentUser){
			throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		}
		Todos.remove(data);
	}
});

function defaultName(currentUser) {
	var nextLetter = 'A'
	var nextName = 'List ' + nextLetter;
	while (Lists.findOne({ name: nextName, createdBy: currentUser })) {
		nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
		nextName = 'List ' + nextLetter;
	}
	return nextName;
}
