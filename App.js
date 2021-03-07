import React, {
  useEffect,
  useState,
} from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';

const fetchPokemon = async (id) => {
  const responsePokemon = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${id}`
  );
  const pokemon = await responsePokemon.json();

  const responseDetails = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`
  );
  const pokemonDetails = await responseDetails.json();

  const name = pokemonDetails.name;

  const description =
    pokemonDetails.flavor_text_entries[0]
      .flavor_text;

  const image =
    pokemon.sprites.other['official-artwork']
      .front_default;

  return { name, description, image };
};

export default () => {
  const dimensions = useWindowDimensions();

  const translation = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const lightOpacity = useSharedValue(1);

  const [pokemon, setPokemon] = useState({
    name: '',
    description: '',
    image: null,
  });

  const updatePokemon = async () => {
    const pokemonID =
      Math.floor(Math.random() * 150) + 1;

    const pokemon = await fetchPokemon(pokemonID);
    setPokemon(pokemon);
  };

  useEffect(() => {
    updatePokemon();
  }, []);

  const startFlashingLight = () => {
    lightOpacity.value = withRepeat(
      withTiming(0.5, { duration: 250 }),
      -1,
      true
    );
  };

  const stopFlashingLight = () => {
    lightOpacity.value = withTiming(1);
  };

  const sayPokemonName = () => {
    Speech.speak(
      `${pokemon.name}: ${pokemon.description}`,
      {
        language: 'en-US',
        pitch: 0.5,
        rate: 1.1,
        onStart: () => {
          overlayOpacity.value = withTiming(0, {
            duration: 250,
          });

          startFlashingLight();
        },
        onDone: stopFlashingLight,
        onStopped: stopFlashingLight,
      }
    );
  };

  const toggleCover = () => {
    if (translation.value === 0) {
      // Open
      translation.value = withTiming(
        dimensions.width,
        { duration: 500 },
        () => {
          runOnJS(sayPokemonName)();
        }
      );
    } else {
      // Close
      translation.value = withTiming(
        0,
        {
          duration: 500,
        },
        () => {
          overlayOpacity.value = 1;
          runOnJS(updatePokemon)();
        }
      );

      Speech.stop();
    }
  };

  const coverStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translation.value },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const lightStyle = useAnimatedStyle(() => {
    return {
      opacity: lightOpacity.value,
    };
  });

  return (
    <>
      <StatusBar hidden />

      <Animated.View
        pointerEvents="none"
        style={[styles.cover, coverStyle]}
      >
        <View style={styles.coverHandle} />
        <View style={styles.coverBinding} />
      </Animated.View>

      <Pressable
        onPress={toggleCover}
        style={styles.pokedexTouchable}
      >
        <View style={styles.pokedex}>
          <SafeAreaView>
            <View style={styles.lights}>
              <View style={styles.mainLight}>
                <Animated.View
                  style={[
                    styles.mainLightInner,
                    lightStyle,
                  ]}
                />
              </View>

              <View style={styles.redLight} />
              <View style={styles.orangeLight} />
              <View style={styles.greenLight} />
            </View>

            <View style={styles.details}>
              <View style={styles.screen}>
                <View style={styles.screenHeader}>
                  <View
                    style={
                      styles.screenHeaderHole
                    }
                  />

                  <View
                    style={
                      styles.screenHeaderHole
                    }
                  />
                </View>

                <View
                  style={styles.screenPokemon}
                >
                  <Animated.View
                    style={[
                      styles.screenPokemonOverlay,
                      overlayStyle,
                    ]}
                  />

                  <Image
                    source={{
                      uri: pokemon.image,
                    }}
                    style={
                      styles.screenPokemonImage
                    }
                  />
                </View>

                <View
                  style={styles.screenSoundHoles}
                >
                  <View
                    style={[
                      styles.screenSoundHole,
                      styles.screenSoundHoleLarge,
                    ]}
                  />

                  <View
                    style={[
                      styles.screenSoundHole,
                      styles.screenSoundHoleSmall,
                    ]}
                  />

                  <View
                    style={[
                      styles.screenSoundHole,
                      styles.screenSoundHoleMedium,
                    ]}
                  />

                  <View
                    style={[
                      styles.screenSoundHole,
                      styles.screenSoundHoleLarge,
                    ]}
                  />
                </View>
              </View>

              <View style={styles.greenButton} />
            </View>
          </SafeAreaView>
        </View>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFillObject,
    top: 150,
    zIndex: 1,
    flexDirection: 'row',
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.4,
  },
  coverHandle: {
    height: 40,
    width: 40,
    // Orange
    backgroundColor: 'rgb(255, 165, 0)',
    borderWidth: 4,
    // Dark orange
    borderColor: 'rgba(0, 0, 0, 0.2)',
    transform: [
      { rotate: '45deg' },
      { translateX: -30 },
    ],
  },
  coverBinding: {
    height: '100%',
    width: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgb(15, 15, 15)',
  },
  pokedexTouchable: {
    flex: 1,
  },
  pokedex: {
    flex: 1,
    backgroundColor: 'red',
  },
  lights: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(15, 15, 15)',
    backgroundColor: 'red',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    paddingBottom: 24,
  },
  mainLight: {
    marginLeft: 20,
    height: 80,
    width: 80,
    // Light blue
    backgroundColor: 'rgb(75, 154, 244)',
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLightInner: {
    height: 40,
    width: 40,
    borderRadius: 20,
    // Dark blue
    backgroundColor: 'rgb(20, 90, 170)',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    shadowOpacity: 0.9,
  },
  redLight: {
    marginLeft: 15,
    height: 20,
    width: 20,
    borderRadius: 10,
    // Red
    backgroundColor: 'rgb(255, 0, 0)',
    borderWidth: 2,
    // Dark red
    borderColor: 'rgb(200, 0, 0)',
  },
  orangeLight: {
    marginLeft: 10,
    height: 20,
    width: 20,
    borderRadius: 10,
    // Orange
    backgroundColor: 'rgb(255, 165, 0)',
    borderWidth: 2,
    // Dark orange
    borderColor: 'rgb(200, 165, 0)',
  },
  greenLight: {
    marginLeft: 10,
    height: 20,
    width: 20,
    borderRadius: 10,
    // Green
    backgroundColor: 'rgb(0, 150, 0)',
    borderWidth: 2,
    // Dark green
    borderColor: 'rgb(0, 100, 0)',
  },
  details: {
    height: '100%',
    borderWidth: 10,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  screen: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
  },
  screenHeaderHole: {
    backgroundColor: 'rgb(200, 0, 0)',
    height: 10,
    width: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    marginHorizontal: 10,
  },
  screenPokemon: {
    marginHorizontal: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    padding: 15,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  screenPokemonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 1,
  },
  screenPokemonImage: {
    height: 150,
    width: 150,
  },
  screenSoundHoles: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 35,
    marginRight: 30,
  },
  screenSoundHole: {
    height: 2,
    width: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 2,
  },
  screenSoundHoleLarge: {
    width: 40,
  },
  screenSoundHoleMedium: {
    width: 38,
  },
  screenSoundHoleSmall: {
    width: 35,
  },
  greenButton: {
    marginLeft: 20,
    backgroundColor: 'darkgreen',
    height: 80,
    width: 140,
    borderRadius: 5,
    borderWidth: 5,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
});
