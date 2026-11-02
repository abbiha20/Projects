  import { generatePatientReportPDF } from '../middleware/generateReportPDF.js';
  import Report from '../models/report.model.js';
  import Patient from '../models/patient.model.js';
  import Consultant from '../models/consultants.model.js';
  import Test from '../models/test.model.js';
  import Hospital from '../models/hospital.model.js';
  import Kit from '../models/kit.model.js';
    
  import { Op } from 'sequelize';

export const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    const { kit_id } = reportData;

    if (kit_id) {
      const kit = await Kit.findByPk(kit_id);

      if (!kit) {
        return res.status(400).json({ error: 'Invalid kit selected' });
      }

      const now = new Date();

      if (kit.expiry_date && new Date(kit.expiry_date) < now) {
        return res.status(400).json({ error: 'The selected kit is expired' });
      }

      if (kit.closing_date) {
        return res.status(400).json({ error: 'The selected kit has a closing date and cannot be used' });
      }

      if (kit.babies_screened >= kit.number_of_kits) {
        return res.status(400).json({ error: 'Maximum number of tests performed for this kit' });
      }

      
      await kit.update({ babies_screened: kit.babies_screened + 1 });
    }

    const newReport = await Report.create(reportData);

    res.status(201).json({ message: 'Report created', report: newReport });
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create report' });
  }
};







export const getAllReports = async (req, res) => {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      patient_name,
      mother_name,
   
      hospital_name,
      mobile_number,
      reference_number,
      report_date_from,
      report_date_to,
      patient_value,
      consultant_name,
      test_name,
    } = req.query;

    const page = parseInt(pageNumber, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;
    const offset = (page - 1) * size;
    const limit = size;

    const filterConditions = {};

    if (patient_value) filterConditions.result = { [Op.like]: `%${patient_value}%` };
    if (reference_number) filterConditions.reference_number = { [Op.like]: `%${reference_number}%` };
   

   
  if (report_date_from && report_date_to) {
  filterConditions.created_at = {
    [Op.between]: [new Date(report_date_from), new Date(report_date_to)],
  };
} else if (report_date_from) {
  filterConditions.created_at = { [Op.gte]: new Date(report_date_from) };
} else if (report_date_to) {
  filterConditions.created_at = { [Op.lte]: new Date(report_date_to) };
}

    const include = [
      {
        model: Patient,
        as: 'patient',
        attributes: ['patient_id', 'name', 'gender', 'date_of_birth', 'mother_name', 'mobile1','mobile2'],
        where: (patient_name || mother_name || mobile_number)
          ? {
              [Op.and]: [
                patient_name || mother_name
                  ? {
                      [Op.or]: [
                        patient_name && { name: { [Op.like]: `%${patient_name}%` } },
                        mother_name && { mother_name: { [Op.like]: `%${mother_name}%` } },
                      ].filter(Boolean),
                    }
                  : null,
              mobile_number
  ? { [Op.or]: [
      { mobile1: { [Op.like]: `%${mobile_number}%` } },
      { mobile2: { [Op.like]: `%${mobile_number}%` } }
    ]}
  : null


              ].filter(Boolean),
            }
          : undefined,
      },
      {
        model: Hospital,
        as: 'hospital',
        required: false,
        attributes: ['hospital_id', 'name'],
        where: hospital_name ? { name: { [Op.like]: `%${hospital_name}%` } } : undefined,
      },
      {
        model: Kit,
        as: 'kit',
        required: false,
        attributes: ['kit_id', 'kit_number', 'lot_number'],
      },
      {
        model: Consultant,
        as: 'consultant',
        required: false,
        attributes: ['consultant_id', 'name'],
        where: consultant_name ? { name: { [Op.like]: `%${consultant_name}%` } } : undefined,
      },
      {
        model: Test,
        as: 'test',
        required: false,
        attributes: ['test_id', 'name', 'unit'],
        where: test_name ? { name: { [Op.like]: `%${test_name}%` } } : undefined,
      },
    ];

    const totalReports = await Report.count({
      where: filterConditions,
      include,
    });

    const reports = await Report.findAll({
      where: filterConditions,
      include,
      offset,
      limit,
      attributes: { exclude: ['kit_id', 'patient_id', 'hospital_id', 'consultant_id', 'test_id'] },
    });

    res.status(200).json({
      reports,
      totalPages: Math.ceil(totalReports / size),
      currentPage: page,
      totalReports,
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch reports' });
  }
};


 export const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      attributes: {
        exclude: ['kit_id','patient_id', 'consultant_id', 'test_id'],
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'name', 'gender', 'date_of_birth'],
          include: [
            {
              model: Hospital,
              as: 'hospital',
              required: false,
              attributes: ['hospital_id', 'name'],
            },
          ],
        },
        {
          model: Consultant,
          as: 'consultant',
          required: false,
          attributes: ['consultant_id', 'name'],
        },
        {
          model: Kit,
          as: 'kit',
          required: false,
          attributes: ['kit_id','kit_number', 'lot_number'],
        },
        {
          model: Test,
          as: 'test',
          required: false,
          attributes: ['test_id', 'name', 'unit'],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Get Report By ID Error:', error);
    res.status(500).json({ error:  error.message || 'Failed to fetch report' });
  }
};

  export const deleteReport = async (req, res) => {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      await report.destroy();
      res.status(200).json({ message: 'Report deleted' });
    } catch (error) {
      console.error('Delete Report Error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete report' });
    }
  };


  export const updateReport = async (req, res) => {
      try {
        const { report_id } = req.params;
    
        const {
          baby_name,
          gender,
          reference_id,
          consultant,
          hospital,
          date_of_birth,
          date,
          test_name,
          patient_value,
          reference_value,
          unit,
          report_status,
          remarks,
          comments,
        } = req.body;
    
        const report = await Report.findByPk(report_id);
    
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
    
        await report.update({
          baby_name,
          gender,
          reference_id,
          consultant,
          hospital,
          date_of_birth,
          date,
          test_name,
          patient_value,
          reference_value,
          unit,
          report_status,
          remarks,
          comments,
        });
    
        res.status(200).json({ message: 'Report updated successfully', report });
      } catch (error) {
        console.error('Update Report Error:', error);
        res.status(500).json({ error: error.message || 'Failed to update report' });
      }
    };
    

    export const downloadPatientReport = async (req, res) => {
      try {
        const { report_id } = req.body;
    
        if (!report_id) {
          return res.status(400).json({ error: 'report_id is required' });
        }
    
        
        const report = await Report.findByPk(report_id); 
    
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
    
      
        const pdfPath = await generatePatientReportPDF(report.dataValues);
    
      
        res.download(pdfPath, 'newborn_screening_report.pdf', (err) => {
          if (err) {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Failed to download report' });
          } else {
          
            fs.unlinkSync(pdfPath);
          }
        });
    
      } catch (error) {
        console.error('Download Report Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate or download report' });
      }
    };
    