import type { GenericObject } from '../common/type-common'
import { flattenAsync } from '../common/flatten-async'
import { toUtf8FromBase64 } from '../bridge/react-native-cxs/RNCxs'
import { flatJsonParse } from '../common/flat-json-parse'
import isUrl from 'validator/lib/isURL'
import type { InvitationPayload } from './type-invitation'
import { CONNECTION_INVITE_TYPES } from './type-invitation'
import { homeRoute } from '../common'
import type { Connection } from '../store/type-connection-store'

export async function getBase64DecodedInvitation(
  encodedData: string | null | undefined,
) : Promise<false | string> {
  if (!encodedData) {
    return false
  }

  const parsedInviteUrlSafe = await getBase64DecodedData(encodedData, 'NO_WRAP')
  if (parsedInviteUrlSafe) {
    return parsedInviteUrlSafe
  }

  const parsedInviteNoWrap = await getBase64DecodedData(encodedData, 'URL_SAFE')
  if (parsedInviteNoWrap) {
    return parsedInviteNoWrap
  }

  return false
}

export async function getBase64DecodedData(
  encodedData: string,
  decodeType: 'URL_SAFE' | 'NO_WRAP'
): Promise<false | GenericObject> {
  const [decodeInviteError, decodedInviteJson]: [
      null | typeof Error,
      null | string
  ] = await flattenAsync(toUtf8FromBase64)(encodedData, decodeType)
  if (decodeInviteError || !decodedInviteJson) {
    return false
  }

  // if we get some data back after decoding, now we try to parse it and see if it is valid json or not
  let [parseError, invite]: [
      null | typeof Error,
      null | GenericObject
  ] = flatJsonParse(decodedInviteJson)
  if (parseError || !invite) {
    return false
  }

  return invite
}

export const getConnectionLogoUrl = (payload: GenericObject) => {
  if (!payload) {
    return null
  }
  if (payload.profileUrl && isUrl(payload.profileUrl)) {
    return payload.profileUrl
  }
  if (payload.imageUrl && isUrl(payload.imageUrl)) {
    return payload.imageUrl
  }
  return null
}

export const getExistingConnection = (
  allPublicDid: Array,
  allDid: Array,
  publicDID: string | null | undefined,
  DID: string | null | undefined,
) => {
  // check if connection already exists
  // possible cases:
  // 1. we scanned the same QR containing invitation without a public DID -
  // check senderDID over all stored connections
  // 2. we scanned a different QR containing invitation with public DID -
  // check publicDID over all stored connections with set publicDID
  return (publicDID ? allPublicDid[publicDID] : undefined) || allDid[DID]
}

export function shouldSendRedirectMessage(
  existingConnection: Connection,
  payload: InvitationPayload,
  publicDID: string | null,
  DID: string | null,
) {
  // for Out-of-Band invitation we should send reuse message even if we scanned the same invitation
  // else send redirect only if we scanned invitation we same publicDID but different senderDID
  if (existingConnection.isCompleted && payload.type === CONNECTION_INVITE_TYPES.ARIES_OUT_OF_BAND) {
    return true
  }
  if (publicDID) {
    return existingConnection.publicDID === publicDID && existingConnection.senderDID !== DID
  }
  return false
}

export const prepareParamsForExistingConnectionRedirect = (
  existingConnection: Connection,
  invitation: InvitationPayload,
) => {
  const { publicDID, DID } = invitation.senderDetail
  const {
    senderName,
    identifier,
    logoUrl: image,
    senderDID,
  } = existingConnection

  const sendRedirectMessage = shouldSendRedirectMessage(
    existingConnection,
    invitation,
    publicDID,
    DID
  )

  return {
    senderDID,
    senderName,
    identifier,
    image,
    backRedirectRoute: homeRoute,
    showExistingConnectionSnack: true,
    qrCodeInvitationPayload: invitation,
    // do not send redirect message if we scanned the same invitation twice
    sendRedirectMessage: sendRedirectMessage,
    notificationOpenOptions: null,
  }
}