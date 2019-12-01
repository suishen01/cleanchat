import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Events, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

/*
  Generated class for the ChatProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ChatProvider {
  firebuddychats = firebase.database().ref('/buddychats');
  buddy: any;
  buddymessages = [];
  ignore = false;
  url = ('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze' +
      '?key=AIzaSyDqLLJeJgVpERW-ccwqCipy5JdEX0kKXjQ');
  constructor(public events: Events, private http: HttpClient, public alertCtrl: AlertController) {

  }

  initializebuddy(buddy) {
    this.buddy = buddy;
  }

  addnewmessage(msg, tolerance) {
    if (this.buddy) {
      var promise = new Promise((resolve, reject) => {
          this.http.post(this.url, {
            comment: {'text': msg},
            languages: ['en'],
            requestedAttributes: {'TOXICITY': {}}
          }).subscribe((response) => {
            console.log(response.attributeScores.TOXICITY.summaryScore.value);
            let toxicalert = this.alertCtrl.create({
              title: 'Toxic Contents Detected',
              subTitle: 'Your message contains toxic contents, your friend may not receive it.',
              buttons: [{
                        text: 'Ignore Once'
                      },
                      {
                        text: 'Ignore for All',
                        handler: () => {
                          this.ignore = true;
                        }
                      }]
            });
            if (response.attributeScores.TOXICITY.summaryScore.value >= tolerance && !this.ignore) {
              toxicalert.present();
            }
            this.firebuddychats.child(firebase.auth().currentUser.uid).child(this.buddy.uid).push({
              sentby: firebase.auth().currentUser.uid,
              message: msg,
              toxicity: response.attributeScores.TOXICITY.summaryScore.value,
              timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
              this.firebuddychats.child(this.buddy.uid).child(firebase.auth().currentUser.uid).push({
                sentby: firebase.auth().currentUser.uid,
                message: msg,
                toxicity: response.attributeScores.TOXICITY.summaryScore.value,
                timestamp: firebase.database.ServerValue.TIMESTAMP
              }).then(() => {
                resolve(true);
              }).catch((err) => {
                reject(err);
              })
            })
          })
        })
      return promise;
    }
  }

  getbuddymessages() {

    let temp;
    this.firebuddychats.child(firebase.auth().currentUser.uid).child(this.buddy.uid).on('value', (snapshot) => {
      this.buddymessages = [];
      temp = snapshot.val();
      for (var tempkey in temp) {
        this.buddymessages.push(temp[tempkey]);
      }
      this.events.publish('newmessage');
    })
  }

}
