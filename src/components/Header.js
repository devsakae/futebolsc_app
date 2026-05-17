import React from 'react';
import { View, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../constants/Colors';

const Header = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/icon.png')} // Fallback if screen.png isn't available
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.surface,
  },
  container: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 71, 50, 0.3)', // outline variant low opacity
  },
  logo: {
    height: 60,
    width: 200,
  },
});

export default Header;
