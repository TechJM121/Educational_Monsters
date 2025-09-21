import { useState, useEffect } from 'react';
import { DeviceCapability } from '../types/animation';
import { detectDeviceCapability } from '../utils/deviceCapability';

export const useDeviceCapability = (): DeviceCapability => {
  const [capability, setCapability] = useState<DeviceCapability>('medium');
  
  useEffect(() => {
    const detectedCapability = detectDeviceCapability();
    setCapability(detectedCapability);
  }, []);
  
  return capability;
};