
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Permission {
  name: string;
  description: string;
  roles: {
    admin: boolean;
    treasurer: boolean;
    secretary: boolean;
    member: boolean;
  };
}

const permissions: Permission[] = [
  {
    name: 'Manage Members',
    description: 'Add, remove, and modify member roles',
    roles: { admin: true, treasurer: false, secretary: false, member: false }
  },
  {
    name: 'Record Contributions',
    description: 'Record and verify member contributions',
    roles: { admin: true, treasurer: true, secretary: false, member: false }
  },
  {
    name: 'Approve Loans',
    description: 'Review and approve loan applications',
    roles: { admin: true, treasurer: true, secretary: false, member: false }
  },
  {
    name: 'Generate Reports',
    description: 'Access and generate financial reports',
    roles: { admin: true, treasurer: true, secretary: true, member: false }
  },
  {
    name: 'View Financials',
    description: 'View group financial information',
    roles: { admin: true, treasurer: true, secretary: true, member: true }
  },
  {
    name: 'Make Contributions',
    description: 'Make personal contributions to the group',
    roles: { admin: true, treasurer: true, secretary: true, member: true }
  }
];

const PermissionMatrix = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Permission</th>
                <th className="text-center p-2">Admin</th>
                <th className="text-center p-2">Treasurer</th>
                <th className="text-center p-2">Secretary</th>
                <th className="text-center p-2">Member</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </td>
                  <td className="text-center p-2">
                    {permission.roles.admin ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-2">
                    {permission.roles.treasurer ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-2">
                    {permission.roles.secretary ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="text-center p-2">
                    {permission.roles.member ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionMatrix;
