import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer){
  //runs only on server
  //send only public tasks or ones that belong to owner
  Meteor.publish('tasks', function tasksPublication(){
    return Tasks.find({
      $or: [
        {private: { $ne: true }},
        {owner : this.userId }, 
      ], 
    }); 
  });
}
 
Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);
 
    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== userId) {
      // only owner can delete private task
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== userId) {
      // only owner can update private task
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { checked: setChecked } });
  },
  
  'tasks.setPrivate'(taskId, setToPrivate){
      check(taskId, String);
      check(setToPrivate,Boolean);

      const task = Tasks.findOne(taskId);

      // only task owner can make a task private
      if (task.owner !== this.userId){
        throw new Meteor.Error('not-authorized');
      }
      
      Tasks.update(taskId, { $set: {private: setToPrivate } }); 
  },


});
