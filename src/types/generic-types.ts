type ActionResultSuccess<T> = {
    success: true
    data: T
}

type ActionResultFailure = {
    success: false
    error: any

}

export type ActionResult<T> = ActionResultSuccess<T> | ActionResultFailure

