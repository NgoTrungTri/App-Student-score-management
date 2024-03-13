import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet } from 'react-native';

const HOST = "http://192.168.1.8:8000"

const Register = ({ navigation }) => {
    const [user, setUser] = useState({
        "email": "",
        "username": "",
        "password": "",
        "avatar": ""
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const HOST = "http://192.168.1.8:8000/"

    const register = async () => {
        setLoading(true);

        let jsonData = {
          "email": email,
          "username": username,
          "password": password,
      };

                try {
                  let res = await fetch(`${HOST}/users/register/`,  {
                      method: 'POST',
                      body: JSON.stringify(jsonData),
                      headers: {
                          'Content-Type': 'multipart/form-data'
                      }
                  });
                  
                  console.info(res.data);
                  navigation.navigate("Login");
              } catch (ex) {
                  console.error(ex);
              } finally {
                  setLoading(false);
              }
          }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permission Denied!");
        } else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.cancelled) {
                change("avatar", res.assets[0]);
            }          
        }
    }

    const change = (field, value) => {
        setUser(current => {
            return { ...current, [field]: value }
        })
    }

    return (
      <View style={Style.container}>
        <Text style={Style.title}>ĐĂNG KÝ</Text>
  
        <TextInput
          value={user.email}
          onChangeText={text => setEmail(text)}
          style={Style.input}
          placeholder="Email của trường cấp..."
        />
        <TextInput
          value={user.username}
          onChangeText={text => setUsername(text)}
          style={Style.input}
          placeholder="Tên đăng nhập..."
        />
        <TextInput
          value={user.password}
          onChangeText={text => setPassword(text)}
          style={Style.input}
          placeholder="Mật khẩu..."
        />
        <TouchableOpacity style={Style.input} onPress={picker}>
          <Text>Chọn ảnh đại diện...</Text>
        </TouchableOpacity>
  
        {user.avatar ?  <Image source={{uri: user.avatar.uri }} style={Style.avatar} />: null}
      
        {loading === true ? (
          <ActivityIndicator />
        ) : ( 
          <TouchableOpacity onPress={register}>
            <Text style={Style.button}>Đăng ký</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  export default Register;

  const Style = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 38,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: '80%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
    },
    button: {
      backgroundColor: 'blue',
      color: 'white',
      padding: 10,
      textAlign: 'center',
      width: 300,
    },
    avatar: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
  });