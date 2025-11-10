const { Schema, model, Types } = require('mongoose');

// Pivot: relación muchos a muchos entre Role y Permission
const rolePermissionSchema = new Schema({
  role: { type: Types.ObjectId, ref: 'Role', required: true, index: true },
  permission: { type: Types.ObjectId, ref: 'Permission', required: true, index: true },
}, { timestamps: true });

rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

module.exports = model('RolePermission', rolePermissionSchema);
