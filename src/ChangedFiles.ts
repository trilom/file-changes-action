import {File} from './File'

export class ChangedFiles {
  updated: string[] = []
  created: string[] = []
  deleted: string[] = []
  files: string[] = []

  getOutput(files: string[], format: string): string {
    if (format === 'json') {
      return JSON.stringify(files)
    } else {
      return files.join(format)
    }
  }

  createdOutput(format: string): string {
    return this.getOutput(this.created, format)
  }

  fileOutput(format: string): string {
    return this.getOutput(this.files, format)
  }

  updatedOutput(format: string): string {
    return this.getOutput(this.updated, format)
  }

  deletedOutput(format: string): string {
    return this.getOutput(this.deleted, format)
  }
}

export async function sortChangedFiles(files: any): Promise<ChangedFiles> {
  return files.reduce((acc: ChangedFiles, f: File) => {
    if (f.status === 'added' || f.added) {
      acc.created.push(f.filename === undefined ? f.added : f.filename)
      acc.files.push(f.filename === undefined ? f.added : f.filename)
    }
    if (f.status === 'removed' || f.removed) {
      acc.deleted.push(f.filename === undefined ? f.removed : f.filename)
    }
    if (f.status === 'modified' || f.modified) {
      acc.updated.push(f.filename === undefined ? f.modified : f.filename)
      acc.files.push(f.filename === undefined ? f.modified : f.filename)
    }
    if (f.status === 'renamed') {
      acc.created.push(f.filename)
      acc.deleted.push(f.previous_filename)
    }
    return acc
  }, new ChangedFiles())
}
