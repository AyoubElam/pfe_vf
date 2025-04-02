// src/interface-adapters/controllers/PfeLivrableController.js
import { PfeLivrableRepository } from '../../application/repositories/PfeLivrableRepository.js';
import { ValidationCommentRepository } from '../../application/repositories/ValidationCommentRepository.js';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});
const upload = multer({ storage });

export class PfeLivrableController {
  constructor() {
    this.repository = new PfeLivrableRepository();
    this.validationRepository = new ValidationCommentRepository();
  }

  async getDocumentsForStudent(req, res) {
    try {
      const { idEtudiant } = req.query;
      if (!idEtudiant) {
        return res.status(400).send('Missing idEtudiant');
      }
      const documents = await this.repository.getDocumentsForStudent(Number(idEtudiant));
      res.json(documents);
    } catch (error) {
      console.error('❌ Error fetching documents for student:', error);
      res.status(500).send(`Server error: ${error.message}`);
    }
  }

  async getDocumentsForTutor(req, res) {
    try {
      const { idTuteur } = req.query;
      if (!idTuteur) {
        return res.status(400).json({ error: 'Missing idTuteur parameter' });
      }
      const documents = await this.repository.getDocumentsForTutor(Number(idTuteur));
      res.json(documents);
    } catch (error) {
      console.error('❌ Error fetching documents for tutor:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }

  async getDocumentsForProfessor(req, res) {
    try {
      const { idEncadrant } = req.query;
      if (!idEncadrant) {
        return res.status(400).json({ error: 'Missing idEncadrant parameter' });
      }
      const documents = await this.repository.getDocumentsForProfessor(Number(idEncadrant));
      res.json(documents);
    } catch (error) {
      console.error('❌ Error fetching documents for professor:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }

  async submitDocuments(req, res) {
    upload.array('files')(req, res, async (err) => {
      if (err) {
        return res.status(500).send(`Server error: ${err.message}`);
      }
      try {
        const { idEtudiant, idGroupe } = req.body;
        const files = req.files;
        if (!idEtudiant || !idGroupe || !files || files.length === 0) {
          return res.status(400).send('Missing required fields or files');
        }
        const result = await this.repository.submitDocuments(Number(idEtudiant), Number(idGroupe), files);
        res.send(result);
      } catch (error) {
        console.error('❌ Error submitting documents:', error);
        res.status(error.message === 'Unauthorized' ? 403 : error.message === 'PFE not found' ? 404 : 500).send(error.message);
      }
    });
  }

  async deleteDocument(req, res) {
    try {
      const { idEtudiant, idPFE, id } = req.body;
      if (!idEtudiant || !idPFE || !id) {
        return res.status(400).send('Missing required fields');
      }
      const result = await this.repository.deleteDocument(Number(idEtudiant), Number(idPFE), Number(id));
      res.send(result);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      res.status(error.message === 'Unauthorized' ? 403 : error.message === 'Document not found' ? 404 : 500).send(error.message);
    }
  }

  async validateDocument(req, res) {
    try {
      const { idPFE, pfeLivrableId, idEncadrant, validationStatus, comment } = req.body;
      if (!idPFE || !pfeLivrableId || !idEncadrant || !validationStatus) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = await this.validationRepository.createOrUpdateValidation(
        Number(idPFE),
        Number(pfeLivrableId),
        Number(idEncadrant),
        validationStatus,
        comment
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Validation insert/update error:', error);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }

  async deleteValidation(req, res) {
    try {
      const { idPFE, pfeLivrableId, idEncadrant } = req.query;
      if (!idPFE || !pfeLivrableId || !idEncadrant) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = await this.validationRepository.deleteValidation(
        Number(idPFE),
        Number(pfeLivrableId),
        Number(idEncadrant)
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting validation:', error);
      if (error.message === 'Validation not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ error: 'Server error', details: error.message });
      }
    }
  }
}