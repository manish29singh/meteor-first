import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../both/dbconnect';
import '../both/routers';

import './main.html';

Template.todos.helpers({
	'todo' : function(){
		var currentListId = this._id;
		var currentUser = Meteor.userId();
		return Todos.find({createdBy : currentUser, listId : currentListId}, {sort: {createdAt: -1}});
	} 
});

Template.todoItem.helpers({
	'checked' : function() {
		var isCompleted = this.completed;
		if(isCompleted) {
			return 'checked';
		} else {
			return '';
		}
	}
});

Template.todoCount.helpers({
	'totalTodos': function(){
		var currentList = this._id;
		return Todos.find({ listId: currentList }).count();
	},
	'completedTodos': function(){
		var currentList = this._id;
		return Todos.find({ listId: currentList, completed: true }).count();
	}
});

Template.lists.onCreated(function() {
	this.subscribe('lists');
});

Template.lists.helpers({
	'list' : function(){
		var currentUser = Meteor.userId();
		return Lists.find({createdBy : currentUser}, {sort : {name : 1}});
	}
})

Template.addTodo.events({
	'submit form': function(event){
		event.preventDefault();
		var todoName = $('[name="todoName"]').val();
		var currentList = this._id;
		Meteor.call('createListItem', todoName, currentList, function(error){
			if(error){
				console.log(error.reason);
			} else {
				$('[name="todoName"]').val('');
			}
		});
	}
})

Template.todoItem.events({
	'click .delete-todo': function(event){
		event.preventDefault();
		var documentId = this._id;
		var confirm = window.confirm("Delete this task?");
		if(confirm){
			Meteor.call('removeListItem', documentId);
		}
	},

	
	'keyup [name=todoItem]': function(event){
		if(event.which == 13 || event.which == 27){
			$(event.target).blur();
		} else {
			var documentId = this._id;
			var todoItem = $(event.target).val();
			Meteor.call('updateListItem', documentId, todoItem);
		}
	},

	'change [type=checkbox]': function(){
		var documentId = this._id;
		var isCompleted = this.completed;
		if(isCompleted){
			Meteor.call('changeItemStatus', documentId, false);
		} else {
			Meteor.call('changeItemStatus', documentId, true);
		}
	}
})

Template.addList.events({
	'submit form': function(event){
		event.preventDefault();
		var listName = $('[name=listName]').val();
		Meteor.call('createNewList', listName, function(error, results){
			if(error){
				console.log(error.reason);
			} else {
				Router.go('listPage', { _id: results });
				$('[name=listName]').val('');
			}
		});
	}
})

Template.register.events({
	'submit form' : function(event) {
		event.preventDefault();
		
	}
})

Template.login.events({
	'submit form' : function(event) {
		event.preventDefault();
		
	}
})

Template.login.onRendered(function(){
	var validator = $('.login').validate({
		submitHandler : function(event) {
			var email =  $('[name = "email"]').val();
			var password = $('[name = "password"]').val();

			Meteor.loginWithPassword(email, password, function(err){
				if(err) {
					if(err.reason == 'User not found') {
						validator.showErrors ({
							email : err.reason
						});
					}
					if(err.reason == 'Incorrect password') {
						validator.showErrors({
							password : err.reason
						});
					}
				} else {
					var currentRoute = Router.current().route.getName();
					if(currentRoute == 'login') {
						Router.go('home');
					}
				}
			}); 
		}
	});
});

Template.register.onRendered(function(){
	var validator = $('.register').validate({
		submitHandler : function(event) {
			var email =  $('[name = "email"]').val();
			var password = $('[name = "password"]').val();

			Accounts.createUser({
				email : email,
				password : password
			}, function(err) {
				if(err) {
					if(err.reason == "Email already exists."){
						validator.showErrors({
							email: "That email already belongs to a registered user."   
						});
					}
				} else {
					console.log('User saved.');
					Router.go('home');
				}
			});
		}
	});
});

$.validator.setDefaults({
	rules : {
		email : {
			required : true,
			email : true
		},
		password : {
			required : true,
			minlength : 8
		}
	},
	messages: {
		email: {
			required: "You must enter an email address.",
			email: "You've entered an invalid email address."
		},
		password: {
			required: "You must enter a password.",
			minlength: "Your password must be at least {0} characters."
		}
	}
});

Template.navigation.events({
	'click .logout' : function(event) {
		event.preventDefault();
		Meteor.logout();
		Router.go('login');
	}
})
