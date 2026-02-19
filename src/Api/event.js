import api from "../config/axios.config";
import { paymentApi } from "./payment";

const createEvent = (data) => {
  return api.post("/events", data);
};

const deleteEventById = (id) => {
  return api.delete(`/events/${id}`);
};

const getEventById = (id) => {
  return api.get(`/events/getEvent/${id}`);
};

const getEvents = (query) => {
  try {
    const { page = 1, limit = 10, status = 'approved', hasMercadoPago } = query;
    let queryString = `page=${page}&limit=${limit}&status=${status}`;
    
    // Agregar filtro de Mercado Pago si se especifica
    if (hasMercadoPago !== undefined) {
      queryString += `&hasMercadoPago=${hasMercadoPago}`;
    }
    
    // Asegurarnos de usar la URL base correcta
    return api.get(`/events?${queryString}`);
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
};

// Nueva función específica para PDV
const getPdvEvents = () => {
  return getEvents({ 
    status: 'approved', 
    eventType: 'public'
  });
};

const getEventsbyAdmin = (query) => {
  const { page, limit } = query;
  return api.get(`/events/admin/all?page=${page}&limit=${limit}`);
};

const actualizeEventStatus = (id, status) => {
  return api.put(`/events/${id}/status`, { status: status });
};

const searchEvent = (page, limit, filter) => {
  const { title, province, locality, dateMonth, approved } = filter;
  let query = `page=${page}&limit=${limit}`;
  if (title) {
    query += `&title=${title}`;
  }
  if (province.length > 0) {
    query += `&province=${province}`;
  }
  if (locality.length > 0) {
    query += `&locality=${locality}`;
  }
  return api.get(`/events/search?${query}`);
};

const updateEvent = (id, { event, address }) => {
  const eventData = {
    ...event,
    discountCodes: event.discountCodes || [],
  };
  
  return api.put(`/events/${id}`, { 
    event: eventData,
    address 
  });
};

const updateVenueMap = (id, venueMap) => {
  return api.patch(`/events/${id}/venue-map`, { venueMap });
};

const getUserEvents = (page, limit) => {
  return api.get(`/events/user/events?page=${page}&limit=${limit}`);
};

const deleteRrpp = (eventId, rrppId) => {
  return api.delete(`/events/${eventId}/rrpp/${rrppId}`);
};

const getProvinces = () => {
  return api.get("/events/provinces");
};

const getLocalitiesByProvince = (province) => {
  return api.get(`/events/localities-by-province?province=${province}`);
};

const updateRrppName = (eventId, rrppId, name) => {
  return api.put(`/events/${eventId}/rrpp/${rrppId}`, { name });
};

const createRrpp = (eventId, rrppName) => {
  return api.post(`/events/${eventId}/rrpp`, { name: rrppName });
};
const updateCommissionPercentage = (eventId, commissionPercentage) => {
  return api.patch(`/events/${eventId}/commission`, { commissionPercentage });
};

const getEventStats = async () => {
  try {
    // Métricas consolidadas de backend (plataforma vs organizadores, GP-Coins, membresías)
    let adminMetrics = null;
    try {
      const metricsRes = await paymentApi.getAdminMetrics();
      adminMetrics = metricsRes.data;
    } catch (e) {
      console.warn('⚠️ No se pudieron obtener métricas admin:', e);
    }

    // Obtener todos los eventos para calcular métricas por evento/organizador
    const response = await getEventsbyAdmin({ page: 1, limit: 1000 });
    const events = response.data.events || [];
    
    // Obtener payments aprobados para calcular métricas reales por evento
    let payments = [];
    try {
      const paymentsResponse = await paymentApi.getApprovedPayments();
      payments = paymentsResponse.data?.payments || paymentsResponse.data || [];
      console.log('💳 Payments aprobados obtenidos:', payments.length);
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener payments, usando cálculo alternativo:', error);
      payments = [];
    }
    
    // Crear un mapa de payments por eventId para acceso rápido
    // Necesitamos relacionar payments con eventos a través de los ticketIds
    const paymentsByEvent = {};
    const ticketToEventMap = {}; // Mapa de ticketId -> eventId
    
    // Primero, crear un mapa de ticketId a eventId desde los eventos
    events.forEach(event => {
      if (event.tickets && Array.isArray(event.tickets)) {
        event.tickets.forEach(ticket => {
          if (ticket._id) {
            ticketToEventMap[ticket._id.toString()] = event._id.toString();
          }
        });
      }
    });
    
    // Luego, asignar payments a eventos usando los ticketIds
    payments.forEach(payment => {
      if (payment.paymentStatus === 'approved' && payment.tickets && Array.isArray(payment.tickets)) {
        payment.tickets.forEach(ticket => {
          const ticketId = ticket.ticketId?._id || ticket.ticketId?.toString() || ticket.ticketId;
          const eventId = ticketToEventMap[ticketId?.toString()];
          
          if (eventId) {
            if (!paymentsByEvent[eventId]) {
              paymentsByEvent[eventId] = [];
            }
            // Solo agregar el payment una vez por evento (aunque tenga múltiples tickets)
            if (!paymentsByEvent[eventId].find(p => p._id?.toString() === payment._id?.toString())) {
              paymentsByEvent[eventId].push(payment);
            }
          }
        });
      }
    });
    
    console.log('🗺️ Mapa de payments por evento:', Object.keys(paymentsByEvent).length, 'eventos con payments');
    
    // Calcular métricas
    const today = new Date().getTime();
    const activeEvents = events.filter(event => {
      const eventDate = event.dates?.[0]?.timestampStart || 0;
      return event.status === 'approved' && eventDate >= today && !event.deleted;
    });

    // Calcular ventas por evento usando payments reales
    const eventsStats = events.map(event => {
      const eventPayments = paymentsByEvent[event._id] || [];
      
      // Calcular desde payments reales
      let totalSold = 0;
      let totalRevenue = 0; // amount: lo que pagó el cliente por las entradas
      let totalCommissions = 0; // commission: ganancia en comisiones
      
      eventPayments.forEach(payment => {
        if (payment.paymentStatus === 'approved') {
          // Sumar cantidad de tickets vendidos
          if (payment.tickets && Array.isArray(payment.tickets)) {
            payment.tickets.forEach(ticket => {
              totalSold += ticket.quantity || 0;
            });
          }
          
          // Sumar amount (lo que pagó el cliente por las entradas)
          totalRevenue += payment.amount || 0;
          
          // Sumar commission (ganancia en comisiones)
          totalCommissions += payment.commission || 0;
        }
      });
      
      // Si no hay payments, usar cálculo alternativo desde tickets (fallback)
      if (totalSold === 0 && totalRevenue === 0) {
        totalSold = event.tickets?.reduce((sum, ticket) => {
          const sold = ticket.selled || ticket.soldCount || ticket.sold || 0;
          return sum + sold;
        }, 0) || 0;
        
        totalRevenue = event.tickets?.reduce((sum, ticket) => {
          const sold = ticket.selled || ticket.soldCount || ticket.sold || 0;
          return sum + ((ticket.price || 0) * sold);
        }, 0) || 0;
      }
      
      // Debug: Log para eventos con payments
      if (eventPayments.length > 0) {
        console.log(`💰 Evento "${event.title}":`, {
          payments: eventPayments.length,
          totalSold,
          totalRevenue,
          totalCommissions,
          paymentsData: eventPayments.map(p => ({
            amount: p.amount,
            commission: p.commission,
            serviceFee: p.serviceFee,
            tickets: p.tickets
          }))
        });
      }
      
      return {
        _id: event._id,
        title: event.title,
        userEmail: event.userEmail,
        ticketsSold: totalSold,
        revenue: totalRevenue, // amount del payment
        commissions: totalCommissions, // commission del payment
        commissionPercentage: event.commissionPercentage || 0,
        lastSale: event.updatedAt || event.createdAt
      };
    });

    // Calcular totales
    const totalTicketsSold = eventsStats.reduce((sum, event) => sum + event.ticketsSold, 0);
    const totalRevenue = eventsStats.reduce((sum, event) => sum + event.revenue, 0);
    
    // Calcular ganancias en comisiones desde payments reales
    const totalCommissions = eventsStats.reduce((sum, event) => sum + (event.commissions || 0), 0);

    // Organizadores con más eventos (usar revenue calculado desde payments)
    const organizerStats = {};
    events.forEach(event => {
      const email = event.userEmail;
      if (email) { // Solo procesar eventos con email de organizador
        if (!organizerStats[email]) {
          organizerStats[email] = {
            email,
            eventCount: 0,
            totalRevenue: 0
          };
        }
        organizerStats[email].eventCount++;
        
        // Usar el revenue calculado desde payments (ya está en eventsStats)
        const eventStats = eventsStats.find(e => e._id === event._id);
        const eventRevenue = eventStats?.revenue || 0;
        organizerStats[email].totalRevenue += eventRevenue;
      }
    });

    const topOrganizers = Object.values(organizerStats)
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Usar totales del backend cuando existan (incluyen GP-Coins y membresías)
    const platform = adminMetrics?.platform || {};
    const organizer = adminMetrics?.organizer || {};
    const totalTicketsFinal = adminMetrics?.totalTicketsSold ?? totalTicketsSold;
    const totalRevenueTickets = adminMetrics?.totalRevenueFromTickets ?? totalRevenue;

    return {
      data: {
        totalTicketsSold: totalTicketsFinal,
        totalRevenue: totalRevenueTickets,
        totalCommissions: platform.totalCommissions ?? totalCommissions,
        activeEventsCount: activeEvents.length,
        eventsStats: eventsStats.sort((a, b) => b.revenue - a.revenue),
        topOrganizers,
        // Ingresos plataforma (comisiones + planes + GP-Coins) vs organizadores
        platformRevenue: {
          totalCommissions: platform.totalCommissions ?? 0,
          membershipRevenue: platform.membershipRevenue ?? 0,
          gpCoinsRevenue: platform.gpCoinsRevenue ?? 0,
          total: platform.totalPlatformRevenue ?? 0,
        },
        organizerRevenue: organizer.totalRevenueFromTickets ?? Math.max(0, totalRevenueTickets - (platform.totalCommissions ?? totalCommissions)),
      }
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      data: {
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        activeEventsCount: 0,
        eventsStats: [],
        topOrganizers: [],
        platformRevenue: { totalCommissions: 0, membershipRevenue: 0, gpCoinsRevenue: 0, total: 0 },
        organizerRevenue: 0,
      }
    };
  }
};

// Exportación de todas las funciones
const eventApi = {
  // Funciones principales de eventos
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  updateVenueMap,
  deleteEventById,
  actualizeEventStatus,
  
  // Funciones de búsqueda y filtrado
  searchEvent,
  getEventsbyAdmin,
  getUserEvents,
  deleteRrpp,
  getProvinces,
  getLocalitiesByProvince,
  updateRrppName,
  createRrpp,
  updateCommissionPercentage,
  getEventStats
};

export default eventApi;