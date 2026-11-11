'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialSeedData } from '@/lib/seedData';
import { getTodayISO, generateId } from '@/lib/utils';

const STORAGE_KEY = 'outlet_autocorp_data_v1';
const THEME_KEY = 'outlet_autocorp_vip_theme';
const DESIGN_KEY = 'outlet_autocorp_active_design';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(null);
  const [activeDesign, setActiveDesign] = useState('diseno2');
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Carga inicial segura en cliente
  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
          setData(parsed);
        } else {
          const initial = getInitialSeedData();
          setData(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } else {
        const initial = getInitialSeedData();
        setData(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }

      const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
      setTheme(savedTheme);

      const savedDesign = localStorage.getItem(DESIGN_KEY) || 'diseno2';
      setActiveDesign(savedDesign);
    } catch (err) {
      console.error('Error cargando StoreContext:', err);
      const fallback = getInitialSeedData();
      setData(fallback);
    }
  }, []);

  // Guardado automático en localStorage
  useEffect(() => {
    if (isClient && data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Error guardando en localStorage:', err);
      }
    }
  }, [data, isClient]);

  const notify = (message, type = 'success') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const changeDesign = (designId) => {
    setActiveDesign(designId);
    if (isClient) {
      localStorage.setItem(DESIGN_KEY, designId);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (isClient) {
      localStorage.setItem(THEME_KEY, newTheme);
    }
  };

  // Acciones de Negocio
  const addClient = (client) => {
    const newClient = {
      id: generateId('cli'),
      dateRegistered: getTodayISO(),
      visits: [{ date: getTodayISO(), notes: 'Visita inicial registrada en el showroom.' }],
      interestedVehicleIds: [],
      ...client
    };
    setData((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients]
    }));
    notify(`Cliente ${newClient.name} registrado con éxito.`);
    return newClient;
  };

  const addVehicle = (vehicle) => {
    const newVehicle = {
      id: generateId('veh'),
      status: 'disponible',
      dateAdded: getTodayISO(),
      interestedClientIds: [],
      ...vehicle
    };
    setData((prev) => ({
      ...prev,
      vehicles: [newVehicle, ...prev.vehicles]
    }));
    notify(`Vehículo ${newVehicle.brand} ${newVehicle.model} ingresado al catálogo.`);
    return newVehicle;
  };

  const reserveVehicle = (vehicleId, amount, clientId = null) => {
    const veh = (data?.vehicles || []).find((v) => v.id === vehicleId);
    if (!veh) return;

    const numAmount = Number(amount) || 0;
    const client = clientId
      ? (data?.clients || []).find((c) => c.id === clientId)
      : (data?.clients || [])[0];

    const newDownPayment = {
      id: generateId('dp'),
      clientId: client ? client.id : '',
      vehicleId: veh.id,
      amount: numAmount,
      date: getTodayISO(),
      method: 'Transferencia SPEI',
      reference: 'SPEI-RESERVA',
      notes: `Apartado de ${veh.brand} ${veh.model}`
    };

    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: 'apartado' } : v
      ),
      downPayments: [newDownPayment, ...prev.downPayments]
    }));

    notify(`Vehículo apartado y enganche de $${numAmount.toLocaleString('es-MX')} MXN recibido en caja.`);
  };

  const sellVehicle = (vehicleId, finalPrice, clientId = null) => {
    const veh = (data?.vehicles || []).find((v) => v.id === vehicleId);
    if (!veh) return;

    const price = Number(finalPrice) || veh.price;
    const client = clientId
      ? (data?.clients || []).find((c) => c.id === clientId)
      : (data?.clients || [])[0];

    const newSale = {
      id: generateId('sale'),
      clientId: client ? client.id : '',
      vehicleId: veh.id,
      finalAmount: price,
      paymentType: 'Contado',
      advisor: 'Carlos Morales',
      date: getTodayISO(),
      notes: `Venta cerrada de ${veh.brand} ${veh.model}`
    };

    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: 'vendido' } : v
      ),
      sales: [newSale, ...prev.sales]
    }));

    notify(`¡Venta cerrada! ${veh.brand} ${veh.model} marcado como Vendido.`);
  };

  const addShift = (shift) => {
    const newShift = {
      id: generateId('sh'),
      date: getTodayISO(),
      ...shift
    };
    setData((prev) => ({
      ...prev,
      shifts: [newShift, ...prev.shifts]
    }));
    notify(`Guardia para ${newShift.responsible} programada.`);
  };

  const addActivity = (activity) => {
    const newAct = {
      id: generateId('act'),
      date: getTodayISO(),
      status: 'pendiente',
      ...activity
    };
    setData((prev) => ({
      ...prev,
      activities: [newAct, ...prev.activities]
    }));
    notify(`Actividad "${newAct.title}" agregada.`);
  };

  const toggleActivityStatus = (activityId) => {
    setData((prev) => ({
      ...prev,
      activities: prev.activities.map((a) => {
        if (a.id === activityId) {
          const nextStatus = a.status === 'completada' ? 'pendiente' : 'completada';
          notify(`Actividad marcada como ${nextStatus}.`);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    }));
  };

  const addTestDrive = (testDrive) => {
    const newTD = {
      id: generateId('td'),
      date: getTodayISO(),
      status: 'Programada',
      ...testDrive
    };
    setData((prev) => ({
      ...prev,
      testDrives: [newTD, ...prev.testDrives]
    }));
    notify(`Prueba de manejo programada.`);
  };

  const addRequest = (request) => {
    const newReq = {
      id: generateId('req'),
      date: getTodayISO(),
      status: 'Pendiente',
      ...request
    };
    setData((prev) => ({
      ...prev,
      requests: [newReq, ...prev.requests]
    }));
    notify(`Solicitud de crédito registrada.`);
  };

  const addClientVisit = (clientId, note = 'Nueva visita en showroom') => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              visits: [{ date: getTodayISO(), notes: note }, ...(c.visits || [])]
            }
          : c
      )
    }));
    notify('Nueva visita registrada en la ficha del cliente.');
  };

  const resetToDefaults = () => {
    const defaults = getInitialSeedData();
    setData(defaults);
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
    notify('Datos restablecidos a los valores de demostración iniciales.');
  };

  const value = {
    data: data || getInitialSeedData(),
    activeDesign,
    theme,
    toasts,
    changeDesign,
    toggleTheme,
    notify,
    removeToast,
    addClient,
    addVehicle,
    reserveVehicle,
    sellVehicle,
    addShift,
    addActivity,
    toggleActivityStatus,
    addTestDrive,
    addRequest,
    addClientVisit,
    resetToDefaults
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe utilizarse dentro de un StoreProvider');
  }
  return context;
}
