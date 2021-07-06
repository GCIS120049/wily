import React from 'react';
import { Text, View , TouchableOpacity, StyleSheet , TextInput , Image, Alert} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state={
      hasCameraPermissions:null,
      scanned:false,
      scanBookID:'',
      buttonState:'normal',
      scanStudentID:''
    }
  }

  getCameraPermissions=async(ID)=>{
    const {status}= await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions:status==="granted",
      scanned:false, 
      buttonState:ID
    });
  }

  handleBarcodeScanned=async({type,data})=>{
    const {buttonState} = this .state
    
    if(buttonState==="BookId"){
      this.setState({
        scanned: true,
        scanBookID: data,
        buttonState: 'normal'
      });
    }
    else if(buttonState==="StudentId"){
      this.setState({
        scanned: true,
        scanStudentID: data,
        buttonState: 'normal'
      });
    
    }

  }

  handleTransaction=async()=>{
    var transactionStage;
    db.collection("books").doc(this.state.scanBookID).get().then((doc)=>{
      console.log(doc.data)
      var book=doc.data
      if(book.bookAvailibility){
        this.initiateBookIssue()
      }else {
        this.initiateBookReturn()
      }
    })
  }

  initiateBookIssue=async()=>{
    db.collection("transaction").add({
      'studentID':this.state.scanStudentID,
      'bookID':this.state.scanBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':"issue"
    })
    db.collection("books").doc(this.state.scanBookId).update({
      'bookAvailibility':false
    })
    db.collection("students").doc(this.state.scanStudentID).update({
      'booksIssued':firebase.firestore.FieldValue.increment(1)
    })
    Alert.alert('Book Issued!')
    this.setState({
      scanBookID:'',
      scanStudentID:''
    })
  }

  initiateBookReturn=async()=>{
    db.collection("transaction").add({
      'studentID':this.state.scanStudentID,
      'bookID':this.state.scanBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':"return"
    })
    db.collection("books").doc(this.state.scanBookId).update({
      'bookAvailibility':true
    })
    db.collection("students").doc(this.state.scanStudentID).update({
      'booksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert('Book Returned!')
    this.setState({
      scanBookID:'',
      scanStudentID:''
    })
  }

    render() {
      const hasCameraPermissions=this.state.hasCameraPermissions;
      const scanned=this.state.scanned;
      const buttonState=this.state.buttonState;
      if(buttonState==='clicked' && hasCameraPermissions){
        return(
          <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarcodeScanned}
          style={StyleSheet.absoluteFillObject}/>
        )
      }else if(buttonState==='normal'){
        return(
          <View style={styles.container}>
            <View>
              <Image source={require('../assets/book.png')} style={{width:200,height:200}}/>
            </View>
            
            <View style={styles.inputView}>
              <TextInput style={styles.inputBox}
              placeholder="Book ID" ></TextInput>
              <TouchableOpacity style={styles.scanButton}
              onPress={()=>{this.getCameraPermissions("bookID")}} >
                <Text style={styles.buttonText}>SCAN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
              <TextInput style={styles.inputBox}
              placeholder="Student ID" ></TextInput>
              <TouchableOpacity style={styles.scanButton}
              onPress={()=>{this.getCameraPermissions("studentID")}}>
                <Text style={styles.buttonText}>SCAN</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        )
      }
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.displayText}>
          {hasCameraPermissions===true?this.state.scanData:"REQUEST CAMERA PERMISSIONS"}
          </Text>
          <TouchableOpacity style={styles.scanButton}
          onPress={this.getCameraPermissions}>
            <Text style={styles.buttonText}>SCAN QR CODE</Text>
          </TouchableOpacity>
        </View>
      );
    }
}
const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 },
    buttonText:{ fontSize: 20, },
    inputView:{ flexDirection: 'row', margin: 20 },
    inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 },
    scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
    submitButton:{
      backgroundColor:'red',
      width:'150px',
      height:'50px'
    },

});