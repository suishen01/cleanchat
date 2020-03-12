import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ImghandlerProvider } from '../../providers/imghandler/imghandler';
import { UserProvider } from '../../providers/user/user';
import firebase from 'firebase';
/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  imgurl = 'https://firebasestorage.googleapis.com/v0/b/myapp-4eadd.appspot.com/o/chatterplace.png?alt=media&token=e51fa887-bfc6-48ff-87c6-e2c61976534e';
  moveon = true;
  avatar: string;
  displayName: string;
  tolerance: number;
  saturation: number;
  uid: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public imgservice: ImghandlerProvider,
    public userservice: UserProvider, public zone: NgZone, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
  }

  ionViewWillEnter() {
    this.loaduserdetails();
  }

  chooseimage() {
    let loader = this.loadingCtrl.create({
      content: 'Please wait'
    })
    loader.present();
    this.imgservice.uploadimage().then((uploadedurl: any) => {
      loader.dismiss();
      this.zone.run(() => {
        this.imgurl = uploadedurl;
        this.moveon = false;
      })
    })
  }

  updateproceed() {
    let loader = this.loadingCtrl.create({
      content: 'Please wait'
    })
    loader.present();
    this.userservice.updateimage(this.imgurl).then((res: any) => {
      loader.dismiss();
      if (res.success) {
        this.navCtrl.setRoot('TabsPage');
      }
      else {
        alert(res);
      }
    })
  }

  proceed() {
    this.navCtrl.setRoot('TabsPage');
  }

  loaduserdetails() {
    this.userservice.getuserdetails().then((res: any) => {
      this.uid = res.uid.substring(0, 7);
      this.displayName = res.displayName;
      this.tolerance = res.tolerance;
      this.saturation = res.tolerance*100;
      this.zone.run(() => {
        this.avatar = "../assets/user.png";
      })
    })
  }

  editname() {
    let statusalert = this.alertCtrl.create({
      buttons: ['okay']
    });
    let alert = this.alertCtrl.create({
      title: 'Edit Nickname',
      inputs: [{
        name: 'nickname',
        placeholder: 'Nickname'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {

        }
      },
      {
        text: 'Edit',
        handler: data => {
          if (data.nickname) {
            this.userservice.updatedisplayname(data.nickname).then((res: any) => {
              if (res.success) {
                statusalert.setTitle('Updated');
                statusalert.setSubTitle('Your nickname has been changed successfully!!');
                statusalert.present();
                this.zone.run(() => {
                  this.displayName = data.nickname;
                })
              }

              else {
                statusalert.setTitle('Failed');
                statusalert.setSubTitle('Your nickname was not changed');
                statusalert.present();
              }

            })
          }
        }

      }]
    });
    alert.present();
  }

  edittolerance() {
    let statusalert = this.alertCtrl.create({
      buttons: ['okay']
    });
    let alert = this.alertCtrl.create({
      title: 'Edit Tolerance',
      inputs: [{
        name: 'tolerance',
        placeholder: 'Tolerance'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {

        }
      },
      {
        text: 'Edit',
        handler: data => {
          if (data.tolerance) {
            this.userservice.updatetolerance(data.tolerance).then((res: any) => {
              if (res.success) {
                statusalert.setTitle('Updated');
                statusalert.setSubTitle('Your tolerance has been changed successfully!!');
                statusalert.present();
                this.zone.run(() => {
                  this.tolerance = data.tolerance;
                })
              }

              else {
                statusalert.setTitle('Failed');
                statusalert.setSubTitle('Your tolerance was not changed');
                statusalert.present();
              }

            })
          }
        }

      }]
    });
    alert.present();
  }

  updatetolerance(rangeValue) {
      let statusalert = this.alertCtrl.create({
        buttons: ['okay']
      });
      this.userservice.updatetolerance(rangeValue.value/100).then((res: any) => {
        if (res.success) {
          statusalert.setTitle('Updated');
          statusalert.setSubTitle('Your tolerance has been changed successfully!!');
          statusalert.present();
          this.zone.run(() => {
            this.tolerance = rangeValue.value/100;
            this.saturation = this.tolerance*100;
            console.log(this.tolerance);
          })
        }

        else {
          statusalert.setTitle('Failed');
          statusalert.setSubTitle('Your tolerance was not changed');
          statusalert.present();
        }

      })
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.navCtrl.parent.parent.setRoot('LoginPage');
    })
  }


}
