const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveLink } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let screenshotUrl = '';
    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.screenshot) {
      screenshotUrl = req.body.screenshot;
    }

    const techArray = Array.isArray(techStack)
      ? techStack
      : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);

    const project = await Project.create({
      title,
      description,
      techStack: techArray,
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      screenshot: screenshotUrl,
      owner: req.user._id,
      likedBy: [],
    });

    const populatedProject = await Project.findById(project._id).populate('owner', 'name email profilePic');
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (with optional search/trending filter)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { search, tech, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (tech) {
      query.techStack = { $regex: tech, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'trending') {
      // Sort by length of likedBy array descending using aggregate or fetch and sort
      const projects = await Project.find(query)
        .populate('owner', 'name email profilePic')
        .lean();
      
      projects.sort((a, b) => (b.likedBy ? b.likedBy.length : 0) - (a.likedBy ? a.likedBy.length : 0));
      return res.json(projects);
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email profilePic')
      .sort(sortOptions);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email profilePic bio skills education')
      .populate('likedBy', 'name profilePic');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { title, description, techStack, githubLink, liveLink } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (liveLink !== undefined) project.liveLink = liveLink;
    if (techStack) {
      project.techStack = Array.isArray(techStack)
        ? techStack
        : techStack.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.file) {
      project.screenshot = `/uploads/${req.file.filename}`;
    }

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id).populate('owner', 'name email profilePic');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Star / Like or Unstar project
// @route   PUT /api/projects/:id/star
// @access  Private
const starProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user._id;
    const isLiked = project.likedBy.some(id => id.toString() === userId.toString());

    if (isLiked) {
      project.likedBy = project.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      project.likedBy.push(userId);

      // Create notification for owner if not self-star
      if (project.owner.toString() !== userId.toString()) {
        const notif = await Notification.create({
          userId: project.owner,
          type: 'star',
          fromUser: userId,
          itemRef: { itemType: 'project', itemId: project._id },
        });

        // Trigger Socket.IO event if io is attached to app
        const io = req.app.get('io');
        if (io) {
          const populatedNotif = await Notification.findById(notif._id).populate('fromUser', 'name profilePic');
          io.to(project.owner.toString()).emit('notification_received', populatedNotif);
        }
      }
    }

    await project.save();
    const updated = await Project.findById(project._id)
      .populate('owner', 'name email profilePic')
      .populate('likedBy', 'name profilePic');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  starProject,
};
