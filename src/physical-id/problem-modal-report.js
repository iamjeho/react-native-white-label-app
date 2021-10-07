// @flow

import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import LottieView from 'lottie-react-native'
import { moderateScale, verticalScale } from 'react-native-size-matters'
import { useDispatch } from 'react-redux'

import { colors, fontSizes } from '../common/styles'
import { Button } from '../components/buttons/button'
import { modalOptions } from '../connection-details/utils/modalOptions'
import { homeRoute, problemReportModalRoute } from '../common'
import { updateHistoryEvent } from '../connection-history/connection-history-store'

const ProblemModalReport = ({ navigation, route }: any) => {
  const event = route.params?.event || {}

  const dispatch = useDispatch()

  const onPress = () => {
    dispatch(updateHistoryEvent({
      ...event,
      showBadge: false,
    }))
    navigation.navigate(homeRoute)
  }

  return (
    <>
      <View style={styles.container}>
        <LottieView
          source={require('../images/red-cross-lottie.json')}
          autoPlay
          loop={false}
          style={styles.across}
        />
        <Text style={styles.errorDescription}>
          {
            event.data ? event.data.error : 'Failed to issue ID documents'
          }
        </Text>
      </View>
      <Button
        onPress={onPress}
        labelStyle={styles.greenButtonLabel}
        label={'Ok'}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: moderateScale(16),
  },
  errorDescription: {
    color: colors.gray1,
    fontSize: moderateScale(22),
    textAlign: 'center',
    marginVertical: 20,
  },
  darkLabel: {
    fontSize: moderateScale(17),
    color: colors.gray1,
  },
  greenButtonLabel: {
    fontSize: verticalScale(fontSizes.size4),
    color: colors.white,
  },
  across: {
    width: 120,
    height: 120,
  },
})

const navigationOptions = modalOptions('ID Verification failed', 'CloseIcon')

export const problemModalReport = {
  routeName: problemReportModalRoute,
  screen: ProblemModalReport,
}

problemModalReport.screen.navigationOptions = navigationOptions
