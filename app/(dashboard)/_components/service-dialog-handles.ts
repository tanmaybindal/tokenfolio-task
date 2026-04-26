'use client';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import type { ServiceResponse } from '@/types';

export const addServiceDialogHandle = DialogPrimitive.createHandle();
export const editServiceDialogHandle =
  DialogPrimitive.createHandle<ServiceResponse>();
export const deleteServiceDialogHandle =
  AlertDialogPrimitive.createHandle<ServiceResponse>();
