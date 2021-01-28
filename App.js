import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, Image, Animated, SafeAreaView } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import DATA from './data';
import { Directions, FlingGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const OVERFLOW_HEIGHT = 70;
const SPACING = 10;
const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.7;
const VISIBLE_ITEMS = 3;

const OverflowItems = ({ data, scrollXAnimated }) => {
   const inputRange = [-1, 0, 1];
   const translateY = scrollXAnimated.interpolate({
      inputRange,
      outputRange: [OVERFLOW_HEIGHT, 0, -OVERFLOW_HEIGHT]
   });
   return (
      <View style={styles.overflowContainer}>
         <Animated.View style={{ transform: [{ translateY }] }}>
            {data.map((item, index) => {
               return (
                  <View key={index} style={styles.itemContainer}>
                     <Text style={[styles.title]} numberOfLines={1}>
                        {item.title}
                     </Text>
                     <View style={styles.itemContainerRow}>
                        <Text style={[styles.location]}>
                           <EvilIcons
                              name='location'
                              size={16}
                              color='black'
                              style={{ marginRight: 5 }}
                           />
                           {item.location}
                        </Text>
                        <Text style={[styles.date]}>{item.date}</Text>
                     </View>
                  </View>
               );
            })}
         </Animated.View>
      </View>
   );
};

export default function App() {
   const [data, setData] = React.useState(DATA);
   const scrollXIndex = React.useRef(new Animated.Value(0)).current;
   const scrollXanimated = React.useRef(new Animated.Value(0)).current;
   const [index, setIndex] = React.useState(0);

   const setActiveIndex = React.useCallback((activeIndex) => {
      setIndex(activeIndex);
      scrollXIndex.setValue(activeIndex);
   });
   // const setActiveIndex = (activeIndex) => {
   //    setIndex(activeIndex);
   //    scrollXIndex.setValue(activeIndex);
   // };

   React.useEffect(() => {
      Animated.spring(scrollXanimated, {
         toValue: scrollXIndex,
         useNativeDriver: true
      }).start();
   });

   return (
      <FlingGestureHandler key='left' direction={Directions.LEFT} onHandlerStateChange={ev => {
         if (ev.nativeEvent.state === State.END) {
            if (index === data.length - 1) {
               return;
            }
            setActiveIndex(index + 1);
         }
      }} >
         <FlingGestureHandler key='right' direction={Directions.RIGHT} onHandlerStateChange={ev => {
            if (ev.nativeEvent.state === State.END) {
               if (index === 0) {
                  return;
               }
               setActiveIndex(index - 1);
            }
         }} >
            <SafeAreaView style={styles.container}>
               <StatusBar style="auto" />
               <OverflowItems data={DATA} scrollXAnimated={scrollXanimated} />
               <FlatList data={DATA} keyExtractor={(_, index) => String(index)} horizontal inverted scrollEnabled={false} removeClippedSubviews={false}
                  // Con esto se obtiene el contenedor de renderItem
                  CellRendererComponent={({ item, index, children, style, ...props }) => {
                     const newStyle = [style, { zIndex: data.length - index }];
                     return (
                        <View style={newStyle} index={index} {...props}>
                           {children}
                        </View>
                     );
                  }}
                  contentContainerStyle={{ flex: 1, justifyContent: 'center', padding: SPACING * 2 }}
                  renderItem={({ item, index }) => {
                     const inputRange = [index - 1, index, index + 1];
                     const translateX = scrollXanimated.interpolate({
                        inputRange,
                        outputRange: [50, 0, -100]
                     });
                     const scale = scrollXanimated.interpolate({
                        inputRange,
                        outputRange: [0.8, 1, 1.3]
                     });
                     const opacity = scrollXanimated.interpolate({
                        inputRange,
                        outputRange: [1 - (1 / VISIBLE_ITEMS), 1, 0]
                     });
                     return (
                        <Animated.View style={{ position: 'absolute', left: -ITEM_WIDTH / 2, opacity, transform: [{ translateX }, { scale }] }}>
                           <Image source={{ uri: item.poster }} style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }} />
                        </Animated.View>
                     );
                  }} />
            </SafeAreaView>
         </FlingGestureHandler>
      </FlingGestureHandler>

   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#fff',
   },
   title: {
      fontSize: 28,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: -1,
   },
   location: {
      fontSize: 16,
   },
   date: {
      fontSize: 12,
   },
   itemContainer: {
      height: OVERFLOW_HEIGHT,
      padding: SPACING * 2,
   },
   itemContainerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   overflowContainer: {
      height: OVERFLOW_HEIGHT,
      overflow: 'hidden',
   },
});
