import request from '@/lib/request'
import {
  // getCenterAppointmentByIdSchema,
  cancelCenterAppointmentSchema,
  getCenterAppointmentsSchema,
  verifyCheckInCodeSchema,
} from '@zerocancer/shared/schemas/appointment.schema'
import {
  getCenterByIdSchema,
  getCentersQuerySchema,
  inviteStaffSchema,
} from '@zerocancer/shared/schemas/center.schema'
import {
  centerStaffForgotPasswordSchema,
  centerStaffLoginSchema,
  centerStaffResetPasswordSchema,
  createCenterStaffPasswordSchema,
} from '@zerocancer/shared/schemas/centerStaff.schema'
import {
  completeAppointmentSchema,
  deleteResultFileSchema,
  restoreResultFileSchema,
  uploadResultsSchema,
} from '@zerocancer/shared/schemas/result.schema'
import type {
  TCancelCenterAppointmentResponse,
  TCenterStaffForgotPasswordResponse,
  TCenterStaffLoginResponse,
  TCenterStaffResetPasswordResponse,
  TCompleteAppointmentResponse,
  TCreateCenterStaffPasswordResponse,
  TDeleteResultFileResponse,
  TGetCenterAppointmentByIdResponse,
  TGetCenterAppointmentsResponse,
  TGetCenterByIdResponse,
  TGetCentersResponse,
  TInviteStaffResponse,
  TRestoreResultFileResponse,
  TUploadResultsResponse,
  TVerifyCheckInCodeResponse,
} from '@zerocancer/shared/types'
import type { z } from 'zod'
import * as endpoints from './endpoints'

// --- Center Management ---

export const getCenters = async (
  params: z.infer<typeof getCentersQuerySchema>,
): Promise<TGetCentersResponse> => {
  // Validate params using shared Zod schema
  const parsed = getCentersQuerySchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid params for getCenters')
  }
  const res = await request.get(endpoints.getCenters(parsed.data))
  return res as TGetCentersResponse
}

export const getCenterById = async (
  id: string,
): Promise<TGetCenterByIdResponse> => {
  // Validate id parameter using shared Zod schema
  const parsed = getCenterByIdSchema.safeParse({ id })
  if (!parsed.success) {
    throw new Error('Invalid id for getCenterById')
  }
  const res = await request.get(endpoints.getCenterById(id))
  return res as TGetCenterByIdResponse
}

// --- Appointment Management ---

export const getCenterAppointments = async (
  params: z.infer<typeof getCenterAppointmentsSchema>,
): Promise<TGetCenterAppointmentsResponse> => {
  const res = await request.get(endpoints.getCenterAppointments(params))
  return res as TGetCenterAppointmentsResponse
}

export const getCenterAppointmentById = async (
  id: string,
): Promise<TGetCenterAppointmentByIdResponse> => {
  const res = await request.get(endpoints.getCenterAppointmentById(id))
  return res as TGetCenterAppointmentByIdResponse
}

export const cancelCenterAppointment = async (
  id: string,
  params: z.infer<typeof cancelCenterAppointmentSchema>,
): Promise<TCancelCenterAppointmentResponse> => {
  const res = await request.post(endpoints.cancelCenterAppointment(id), params)
  return res as TCancelCenterAppointmentResponse
}

export const verifyCheckInCode = async (
  params: z.infer<typeof verifyCheckInCodeSchema>,
): Promise<TVerifyCheckInCodeResponse> => {
  // Validate params using shared Zod schema
  const parsed = verifyCheckInCodeSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid params for verifyCheckInCode')
  }
  const res = await request.post(endpoints.verifyCheckInCode(), parsed.data)
  return res as TVerifyCheckInCodeResponse
}

// --- Staff Management ---

export const inviteStaff = async (
  params: z.infer<typeof inviteStaffSchema>,
): Promise<TInviteStaffResponse> => {
  const res = await request.post(endpoints.inviteStaff(), params)
  return res as TInviteStaffResponse
}

export const createCenterStaffPassword = async (
  params: z.infer<typeof createCenterStaffPasswordSchema>,
): Promise<TCreateCenterStaffPasswordResponse> => {
  const res = await request.post(endpoints.createCenterStaffPassword(), params)
  return res as TCreateCenterStaffPasswordResponse
}

export const centerStaffForgotPassword = async (
  params: z.infer<typeof centerStaffForgotPasswordSchema>,
): Promise<TCenterStaffForgotPasswordResponse> => {
  const res = await request.post(endpoints.centerStaffForgotPassword(), params)
  return res as TCenterStaffForgotPasswordResponse
}

export const centerStaffResetPassword = async (
  params: z.infer<typeof centerStaffResetPasswordSchema>,
): Promise<TCenterStaffResetPasswordResponse> => {
  const res = await request.post(endpoints.centerStaffResetPassword(), params)
  return res as TCenterStaffResetPasswordResponse
}

export const centerStaffLogin = async (
  params: z.infer<typeof centerStaffLoginSchema>,
): Promise<TCenterStaffLoginResponse> => {
  const res = await request.post(endpoints.centerStaffLogin(), params)
  return res as TCenterStaffLoginResponse
}

// Upload results for an appointment
export const uploadResults = async (
  appointmentId: string,
  data: z.infer<typeof uploadResultsSchema>,
): Promise<TUploadResultsResponse> => {
  const validatedData = uploadResultsSchema.safeParse(data)
  if (!validatedData.success) {
    throw new Error('Invalid upload results data')
  }

  const res = await request.post(
    endpoints.uploadResults(appointmentId),
    validatedData.data,
  )
  return res as TUploadResultsResponse
}

// Delete a result file (soft delete)
export const deleteResultFile = async (
  fileId: string,
  data: { reason?: string; notifyPatient?: boolean },
): Promise<TDeleteResultFileResponse> => {
  const validatedData = deleteResultFileSchema.safeParse({
    fileId,
    ...data,
  })
  if (!validatedData.success) {
    throw new Error('Invalid delete file data')
  }

  const res = await request.deleteWithOptions(
    endpoints.deleteResultFile(fileId),
    {
      data: { reason: data.reason, notifyPatient: data.notifyPatient },
    },
  )
  return res as TDeleteResultFileResponse
}

// Restore a soft-deleted result file
export const restoreResultFile = async (
  fileId: string,
): Promise<TRestoreResultFileResponse> => {
  const validatedData = restoreResultFileSchema.safeParse({ fileId })
  if (!validatedData.success) {
    throw new Error('Invalid restore file data')
  }

  const res = await request.post(endpoints.restoreResultFile(fileId))
  return res as TRestoreResultFileResponse
}

// Mark an appointment as completed
export const completeAppointment = async (
  appointmentId: string,
  data: { completionNotes?: string },
): Promise<TCompleteAppointmentResponse> => {
  const validatedData = completeAppointmentSchema.safeParse({
    appointmentId,
    ...data,
  })
  if (!validatedData.success) {
    throw new Error('Invalid complete appointment data')
  }

  const res = await request.post(endpoints.completeAppointment(appointmentId), {
    completionNotes: data.completionNotes,
  })
  return res as TCompleteAppointmentResponse
}
