import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const Header = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 71, 50, 0.3)',
    backgroundColor: Colors.surface,
  },
  logo: {
    height: 60,
    width: 200,
  },
});

export default Header;
