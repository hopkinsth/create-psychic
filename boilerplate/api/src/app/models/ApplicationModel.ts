import { Dream, Dreamconf, AssociationDepths } from '@rvohealth/dream'
import { AllColumns, DBClass, DBColumns, DBTypeCache, InterpretedDBClass } from '../../db/schema'
import SyncedAssociationsVal, {
  SyncedAssociations,
  SyncedBelongsToAssociations,
  VirtualColumns,
} from '../../db/associations'
import dreamconf from '../../conf/dreamconf'

export default class ApplicationModel extends Dream {
  public get DB() {
    return new DBClass()
  }

  public get maxAssociationTypeDepth() {
    return AssociationDepths.EIGHT as const
  }

  public get syncedAssociations(): SyncedAssociations {
    return SyncedAssociationsVal as SyncedAssociations
  }

  public get allColumns(): typeof AllColumns {
    return AllColumns as typeof AllColumns
  }

  public get dreamconf(): Dreamconf<
    DBClass,
    InterpretedDBClass,
    SyncedAssociations,
    SyncedBelongsToAssociations,
    VirtualColumns,
    typeof DBColumns,
    typeof DBTypeCache
  > {
    return dreamconf
  }
}
