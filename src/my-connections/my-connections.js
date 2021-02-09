// @flow
import React, { useCallback, useEffect, useMemo } from 'react'
import { Platform, View, FlatList } from 'react-native'
import { connect, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import Snackbar from 'react-native-snackbar'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

import { newConnectionSeen } from '../connection-history/connection-history-store'
import { HomeHeader, CameraButton } from '../components'
import { ConnectionCard } from './connection-card/connection-card'
import { qrCodeScannerTabRoute } from '../common'
import { getConnections } from '../store/connections-store'
import { connectionHistRoute } from '../common'
import {
  getAllConnection,
  getConnectionHydrationState,
  getHistory,
  getMessageDownloadStatus,
  getSnackError,
  getUnseenMessages,
} from '../store/store-selector'
import { externalStyles } from './styles'
import { getUnacknowledgedMessages } from '../store/config-store'
import { GET_MESSAGES_LOADING } from '../store/type-config-store'
import { withStatusBar } from '../components/status-bar/status-bar'
import { NotificationCard } from '../in-app-notification/in-app-notification-card'
import { colors } from '../common/styles'
import type { MyConnectionsProps } from './type-my-connections'

import {
  HEADLINE,
  SHOW_CAMERA_BUTTON,
  MyConnectionsViewEmptyState,
  CustomMyConnectionsScreen,
// $FlowExpectedError[cannot-resolve-module] external file
} from '../../../../../app/evernym-sdk/connections'
import { EmptyState } from '../home/empty-state'

const headline = HEADLINE || 'My Connections'
const showCameraButton = typeof SHOW_CAMERA_BUTTON === 'boolean' ? SHOW_CAMERA_BUTTON : true

const {
  container,
  flatListContainer,
  flatListInnerContainer,
  outerContainer,
} = externalStyles

const numColumns = 2

const MyConnections = ({
                         route,
                         navigation,
                         onNewConnectionSeen,
                         getUnacknowledgedMessages,
                       }: MyConnectionsProps) => {
  const allConnections = useSelector(getAllConnection)
  const history = useSelector(getHistory)
  const hydrated = useSelector(getConnectionHydrationState)
  const messageDownloadStatus = useSelector(getMessageDownloadStatus)
  const snackError = useSelector(getSnackError)
  const unseenMessages = useSelector(getUnseenMessages)

  const connections = useMemo(() => {
    return getConnections(allConnections)
      .map((connection: any, index) => {
        if (history &&
          history.connections &&
          history.connections[connection.senderDID] &&
          history.connections[connection.senderDID].data &&
          history.connections[connection.senderDID].data.length) {
          const event = history.connections[connection.senderDID].data[
          history.connections[connection.senderDID].data.length - 1]
          return {
            ...connection,
            index,
            date: event.timestamp,
            status: event.status,
            questionTitle: event.name,
            credentialName: event.name,
            type: event.type,
            events:
              history &&
              history.connections &&
              history.connections[connection.senderDID] &&
              history.connections[connection.senderDID].data
                ? history.connections[connection.senderDID].data
                : [],
            senderDID: connection.senderDID,
          }
        }
        return {
          ...connection,
          index,
          date: undefined,
          status: undefined,
          questionTitle: undefined,
          credentialName: undefined,
          type: undefined,
          events:
            history &&
            history.connections &&
            history.connections[connection.senderDID] &&
            history.connections[connection.senderDID].data
              ? history.connections[connection.senderDID].data
              : [],
          senderDID: connection.senderDID,
        }
      })
      .sort((a, b) => {
        if (!b.date) {
          return 0
        }
        let bTimestamp = new Date(b.date).getTime()
        if (!a.date) {
          return 0
        }
        let aTimestamp = new Date(a.date).getTime()
        return bTimestamp - aTimestamp
      })
  }, [allConnections, history])

  const hasNoConnection = useMemo(() => {
    return hydrated ? connections.length === 0 : false
  }, [connections, hydrated])

  useEffect(() => {
    if (snackError) {
      Snackbar.dismiss()
      Snackbar.show({
        text: snackError,
        backgroundColor: colors.red,
        duration: Snackbar.LENGTH_LONG,
      })
    }
  }, [snackError])

  useEffect(() => {
    if (!Object.keys(unseenMessages).length) {
      if (Platform.OS === 'ios') {
        // Sets the current badge number on the app icon to zero. iOS only for now.
        PushNotificationIOS.setApplicationIconBadgeNumber(0)
      }
    }
  }, [unseenMessages])

  const onCardPress = (
    senderName: string,
    image: ?string,
    senderDID: string,
    identifier: string,
  ) => {
    navigation.navigate(connectionHistRoute, {
      senderName,
      image,
      senderDID,
      identifier,
    })
  }

  const keyExtractor = (item: Object) => item.index.toString()

  const onRefresh = useCallback(() => {
    getUnacknowledgedMessages()
  })

  const renderItem = ({ item }: { item: Object }) => {
    const {
      senderName,
      logoUrl,
      senderDID,
      questionTitle,
      status,
      type,
      credentialName,
      date,
      events,
      identifier,
    } = item
    return (
      <ConnectionCard
        onPress={() => {
          onCardPress(senderName, logoUrl, senderDID, identifier)
        }}
        image={logoUrl}
        question={questionTitle}
        {...{
          senderDID,
          events,
          date,
          credentialName,
          type,
          senderName,
          status,
          onNewConnectionSeen,
        }}
      />
    )
  }

  return (
    <View style={outerContainer}>
      <HomeHeader
        headline={headline}
        navigation={navigation}
        route={route}
      />
      <NotificationCard/>
      <View style={container}>
        {hasNoConnection && (
          MyConnectionsViewEmptyState ? <MyConnectionsViewEmptyState /> : <EmptyState />
        )}
        <FlatList
          keyExtractor={keyExtractor}
          style={flatListContainer}
          contentContainerStyle={flatListInnerContainer}
          data={connections}
          renderItem={renderItem}
          onRefresh={onRefresh}
          refreshing={messageDownloadStatus === GET_MESSAGES_LOADING}
          {...{ numColumns }}
        />
      </View>
      {
        showCameraButton &&
        <CameraButton
          onPress={() => navigation.navigate(qrCodeScannerTabRoute)}
        />
      }
    </View>
  )
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onNewConnectionSeen: newConnectionSeen,
      getUnacknowledgedMessages,
    },
    dispatch,
  )

const screen = CustomMyConnectionsScreen || MyConnections

export const MyConnectionsScreen = withStatusBar()(
  connect(null, mapDispatchToProps)(screen),
)