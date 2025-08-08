// const Lead = require('../models/Lead');
// const { validationResult } = require('express-validator');

// // Get all leads
// const getAllLeads = async (req, res) => {
//   try {
//     const { status, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
//     // Build query
//     let query = {};
    
//     if (status) {
//       query.leadStatus = status;
//     }
    
//     if (search) {
//       query.$or = [
//         { companyName: { $regex: search, $options: 'i' } },
//         { contactPersonName: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Calculate skip value for pagination
//     const skip = (page - 1) * limit;
    
//     // Build sort object
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
//     // Execute query with pagination
//     const leads = await Lead.find(query)
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit));
    
//     // Get total count for pagination
//     const total = await Lead.countDocuments(query);
    
//     res.json({
//       leads,
//       pagination: {
//         current: parseInt(page),
//         pages: Math.ceil(total / limit),
//         total,
//         limit: parseInt(limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching leads:', error);
//     res.status(500).json({ 
//       message: 'Error fetching leads', 
//       error: error.message 
//     });
//   }
// };

// // Get single lead by ID
// const getLeadById = async (req, res) => {
//   try {
//     const lead = await Lead.findById(req.params.id);
    
//     if (!lead) {
//       return res.status(404).json({ message: 'Lead not found' });
//     }
    
//     res.json(lead);
//   } catch (error) {
//     console.error('Error fetching lead:', error);
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid lead ID format' });
//     }
//     res.status(500).json({ 
//       message: 'Error fetching lead', 
//       error: error.message 
//     });
//   }
// };

// // Create new lead
// const createLead = async (req, res) => {
//   try {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ 
//         message: 'Validation errors', 
//         errors: errors.array() 
//       });
//     }
    
//     const leadData = req.body;
    
//     // Check if email already exists
//     const existingLead = await Lead.findOne({ email: leadData.email.toLowerCase() });
//     if (existingLead) {
//       return res.status(400).json({ 
//         message: 'Lead with this email already exists' 
//       });
//     }
    
//     const lead = new Lead(leadData);
//     const savedLead = await lead.save();
    
//     res.status(201).json(savedLead);
//   } catch (error) {
//     console.error('Error creating lead:', error);
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => ({
//         field: err.path,
//         message: err.message
//       }));
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: validationErrors 
//       });
//     }
    
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         message: 'Lead with this email already exists' 
//       });
//     }
    
//     res.status(500).json({ 
//       message: 'Error creating lead', 
//       error: error.message 
//     });
//   }
// };

// // Update lead
// const updateLead = async (req, res) => {
//   try {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ 
//         message: 'Validation errors', 
//         errors: errors.array() 
//       });
//     }
    
//     const leadId = req.params.id;
//     const updateData = req.body;
    
//     // Check if email is being changed and if it's unique
//     if (updateData.email) {
//       const existingLead = await Lead.findOne({ 
//         email: updateData.email.toLowerCase(),
//         _id: { $ne: leadId }
//       });
      
//       if (existingLead) {
//         return res.status(400).json({ 
//           message: 'Lead with this email already exists' 
//         });
//       }
//     }
    
//     const lead = await Lead.findByIdAndUpdate(
//       leadId,
//       updateData,
//       { 
//         new: true, 
//         runValidators: true 
//       }
//     );
    
//     if (!lead) {
//       return res.status(404).json({ message: 'Lead not found' });
//     }
    
//     res.json(lead);
//   } catch (error) {
//     console.error('Error updating lead:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid lead ID format' });
//     }
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => ({
//         field: err.path,
//         message: err.message
//       }));
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: validationErrors 
//       });
//     }
    
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         message: 'Lead with this email already exists' 
//       });
//     }
    
//     res.status(500).json({ 
//       message: 'Error updating lead', 
//       error: error.message 
//     });
//   }
// };

// // Delete lead
// const deleteLead = async (req, res) => {
//   try {
//     const lead = await Lead.findByIdAndDelete(req.params.id);
    
//     if (!lead) {
//       return res.status(404).json({ message: 'Lead not found' });
//     }
    
//     res.json({ message: 'Lead deleted successfully', lead });
//   } catch (error) {
//     console.error('Error deleting lead:', error);
    
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid lead ID format' });
//     }
    
//     res.status(500).json({ 
//       message: 'Error deleting lead', 
//       error: error.message 
//     });
//   }
// };

// // Get lead statistics
// const getLeadStats = async (req, res) => {
//   try {
//     const stats = await Lead.aggregate([
//       {
//         $group: {
//           _id: '$leadStatus',
//           count: { $sum: 1 },
//           averageScore: { $avg: '$leadScore' },
//           totalDealValue: { $sum: '$expectedDealValue' }
//         }
//       },
//       {
//         $sort: { count: -1 }
//       }
//     ]);
    
//     const totalLeads = await Lead.countDocuments();
    
//     res.json({
//       totalLeads,
//       statusStats: stats
//     });
//   } catch (error) {
//     console.error('Error fetching lead stats:', error);
//     res.status(500).json({ 
//       message: 'Error fetching lead statistics', 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   getAllLeads,
//   getLeadById,
//   createLead,
//   updateLead,
//   deleteLead,
//   getLeadStats
// };


const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');

const leadController = {
  // Get all leads
  getLeads: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;
      const leads = await Lead.find({ companyId, financialYear })
        .populate('campaignId', 'campaignName')
        .sort({ createdAt: -1 });
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new lead
  createLead: async (req, res) => {
    try {
      const lead = new Lead(req.body);
      await lead.save();
      await lead.populate('campaignId', 'campaignName');
      
      // Update campaign leads count if associated with a campaign
      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(
          lead.campaignId,
          { $inc: { leads: 1 } }
        );
      }
      
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get lead by ID
  getLeadById: async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id).populate('campaignId', 'campaignName');
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update lead
  updateLead: async (req, res) => {
    try {
      const oldLead = await Lead.findById(req.params.id);
      const oldCampaignId = oldLead?.campaignId;
      const oldStatus = oldLead?.leadStatus;
      
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('campaignId', 'campaignName');
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Update campaign counts if campaign changed
      if (oldCampaignId && oldCampaignId.toString() !== req.body.campaignId) {
        // Decrease count from old campaign
        await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { leads: -1 } });
      }
      
      if (req.body.campaignId && req.body.campaignId !== oldCampaignId?.toString()) {
        // Increase count for new campaign
        await Campaign.findByIdAndUpdate(req.body.campaignId, { $inc: { leads: 1 } });
      }

      // Update conversion count if status changed to "Closed Won"
      if (oldStatus !== 'Closed Won' && req.body.leadStatus === 'Closed Won' && lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: 1 } });
      } else if (oldStatus === 'Closed Won' && req.body.leadStatus !== 'Closed Won' && lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: -1 } });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete lead
  deleteLead: async (req, res) => {
    try {
      const lead = await Lead.findByIdAndDelete(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Decrease campaign leads count if associated with a campaign
      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(
          lead.campaignId,
          { $inc: { leads: -1 } }
        );
        
        // Decrease conversions count if lead was converted
        if (lead.leadStatus === 'Closed Won') {
          await Campaign.findByIdAndUpdate(
            lead.campaignId,
            { $inc: { conversions: -1 } }
          );
        }
      }
      
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get leads by campaign
  getLeadsByCampaign: async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { companyId, financialYear } = req.query;
      
      const leads = await Lead.find({ 
        campaignId, 
        companyId, 
        financialYear 
      }).populate('campaignId', 'campaignName');
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = leadController;