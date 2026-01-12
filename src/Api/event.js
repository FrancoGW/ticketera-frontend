import api from "../config/axios.config";

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
  return api.put(`/events/${id}/status/`, { status: status });
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
  return api.get(`/event/search?${query}`);
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
    // Obtener todos los eventos para calcular métricas
    const response = await getEventsbyAdmin({ page: 1, limit: 1000 });
    const events = response.data.events || [];
    
    // Calcular métricas
    const today = new Date().getTime();
    const activeEvents = events.filter(event => {
      const eventDate = event.dates?.[0]?.timestampStart || 0;
      return event.status === 'approved' && eventDate >= today && !event.deleted;
    });

    // Calcular ventas por evento
    const eventsStats = events.map(event => {
      const totalSold = event.tickets?.reduce((sum, ticket) => sum + (ticket.selled || 0), 0) || 0;
      const totalRevenue = event.tickets?.reduce((sum, ticket) => {
        return sum + ((ticket.price || 0) * (ticket.selled || 0));
      }, 0) || 0;
      
      return {
        _id: event._id,
        title: event.title,
        userEmail: event.userEmail,
        ticketsSold: totalSold,
        revenue: totalRevenue,
        commissionPercentage: event.commissionPercentage || 0,
        lastSale: event.updatedAt || event.createdAt
      };
    });

    // Calcular totales
    const totalTicketsSold = eventsStats.reduce((sum, event) => sum + event.ticketsSold, 0);
    const totalRevenue = eventsStats.reduce((sum, event) => sum + event.revenue, 0);
    
    // Calcular ganancias en comisiones
    const totalCommissions = eventsStats.reduce((sum, event) => {
      const commission = (event.revenue * (event.commissionPercentage || 0)) / 100;
      return sum + commission;
    }, 0);

    // Organizadores con más eventos
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
        const eventRevenue = event.tickets?.reduce((sum, ticket) => {
          return sum + ((ticket.price || 0) * (ticket.selled || 0));
        }, 0) || 0;
        organizerStats[email].totalRevenue += eventRevenue;
      }
    });

    const topOrganizers = Object.values(organizerStats)
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    return {
      data: {
        totalTicketsSold,
        totalRevenue,
        totalCommissions,
        activeEventsCount: activeEvents.length,
        eventsStats: eventsStats.sort((a, b) => b.revenue - a.revenue),
        topOrganizers
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
        topOrganizers: []
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