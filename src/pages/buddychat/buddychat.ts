import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Content, AlertController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import firebase from 'firebase';
import { UserProvider } from '../../providers/user/user';
/**
 * Generated class for the BuddychatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-buddychat',
  templateUrl: 'buddychat.html',
})
export class BuddychatPage {
  @ViewChild('content') content: Content;
  buddy: any;
  newmessage;
  allmessages = [];
  photoURL;
  tolerance;
  toxicflag = false;
  toxic = true;
  flag = true;
  constructor(public navCtrl: NavController, public navParams: NavParams, public chatservice: ChatProvider,
              public events: Events, public userservice: UserProvider, public zone: NgZone, public alertCtrl: AlertController) {
    this.userservice.getuserdetails().then((res: any) => {
      this.tolerance = res.tolerance;
    });
    this.buddy = this.chatservice.buddy;
    this.photoURL = "../assets/user.png";//firebase.auth().currentUser.photoURL;
    this.scrollto();
    this.events.subscribe('newmessage', () => {
      this.allmessages = [];
      this.zone.run(() => {
        this.allmessages = this.chatservice.buddymessages;
        for (var msg in this.allmessages) {
          if (this.allmessages[msg].toxicity >= this.tolerance && this.flag) {
            this.flag = false;
            let toxicalert = this.alertCtrl.create({
              title: 'Toxic Contents Detected',
              subTitle: 'Messages contain toxic contents, do you want to hide them?',
              buttons: [
                        {
                          text: 'Yes',
                          role: 'cancel',
                          handler: () => {
                            this.toxic = true;
                          }
                        },
                        {
                          text: 'No',
                          handler: () => {
                            this.toxic = false;
                          }
                        }
                      ]
            });
            toxicalert.present();
          }
        }
      })
    })
  }

  addmessage() {
    this.chatservice.addnewmessage(this.newmessage, this.tolerance).then(() => {
      this.content.scrollToBottom();
      this.newmessage = '';
    })
  }

  showtoxic() {
    if (!this.toxicflag) {
      this.toxicflag = true;
    } else {
      this.toxicflag = false;
    }
  }

  ionViewDidEnter() {
    this.chatservice.getbuddymessages();
  }

  scrollto() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 1000);
  }

}
