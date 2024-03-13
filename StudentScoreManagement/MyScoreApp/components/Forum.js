import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';



const Forum = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch('http://192.168.1.8:8000/forumposts/');
        const data = await response.json();
        console.log(data)
        setComments(data.results);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bình luận:', error);
      }
    };

    fetchComments();
  }, [])

  // Đăng bình luận mới
  const postComment = async () => {
    try {
      const response = await fetch('http://192.168.1.7:8000/forumposts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await response.json();
      // Cập nhật danh sách bình luận sau khi đăng
      setComments([...comments, data]);
      setNewComment(''); // Xóa nội dung trong ô nhập
    } catch (error) {
      console.error('Lỗi khi đăng bình luận:', error);
    }
  };

  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diễn Đàn OU</Text>

      {comments === null ? <ActivityIndicator /> : <>
        {
          comments.map(t => (
            <View key={t.id}>
              <View>
                <Text style={{fontSize: 24, fontWeight: 'bold', paddingBottom: 10}}>{t.title}</Text>
              </View>
              <View>
                <Text>Ngày viết: {t.created_date}</Text>             
              </View>
              <View>
                <Text>Ngày cập nhật: {t.updated_date}</Text> 
              </View>
              <View>
                <RenderHtml source={{html: t.content}} contentWidth={width}/>
              </View>
              <View>
                <Text>Tác giả: {t.author.first_name} {t.author.last_name}</Text>
              </View>

            </View>
          ))
        }
      </>}    



      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập bình luận mới"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.button} onPress={postComment}>
          <Text style={styles.buttonText}>Đăng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'blue',
    textAlign: 'center'
  },
  commentContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Forum;
