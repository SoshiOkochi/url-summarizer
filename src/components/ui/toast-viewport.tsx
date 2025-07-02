'use client';

import * as React from 'react';
import { Toaster, toast } from '@/components/ui/toast';

export function ToasterDemo() {
  return (
    <Toaster>
      <Toaster />
    </Toaster>
  );
}
