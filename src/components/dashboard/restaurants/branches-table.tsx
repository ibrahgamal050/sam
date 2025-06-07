"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { IBranch } from "@/types"
import { Edit, MapPin, MoreHorizontal, Phone, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BranchesTableProps {
  branches: IBranch[]
}

export function BranchesTable({ branches }: BranchesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Working Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No branches found.
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch._id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{branch.name.en}</div>
                    <div className="text-xs text-muted-foreground">{branch.name.ar}</div>
                    {branch.isMainBranch && (
                      <Badge variant="outline" className="mt-1">
                        Main Branch
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs">{branch.location.address.en}</div>
                      <div className="text-xs text-muted-foreground">{branch.location.address.ar}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{branch.phone}</span>
                  </div>
                </TableCell>
                <TableCell>{branch.workingHours}</TableCell>
                <TableCell>
                  <Badge variant="outline">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
