'use client';

import * as React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ToastViewport } from '@/components/ui/toast-viewport';
import { Toaster } from '@/components/ui/toaster';

export function ToasterDemo() {
  const { toast } = useToast();

  return (
    <Toaster>
      <ToastViewport />
    </Toaster>
  );
}
