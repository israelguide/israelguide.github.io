  var config = {
    apiKey: "AIzaSyCPZNbrGwgzL1ogAZKuRkcreSwBeccGfMc",
    authDomain: "buddy-ef5f3.firebaseapp.com",
    databaseURL: "https://buddy-ef5f3.firebaseio.com",
    storageBucket: "buddy-ef5f3.appspot.com",
    displayName: "Sergey"
  };
  firebase.initializeApp(config);



firebase.auth().signInWithEmailAndPassword('serhiy.vas@gmail.com','qwerty');

var db = firebase.database();