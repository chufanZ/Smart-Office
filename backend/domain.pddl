(define (domain smart-office)
  (:requirements :strips :typing)
  (:types
    room device
  )

  (:predicates
    (room ?r)
    (light ?l)
    (conditioner ?c)

    (installed-in-light ?l ?r)
    (installed-in-conditioner ?c ?r)

    (light-on ?l)
    (light-off ?l)

    (conditioner-on ?c)
    (conditioner-off ?c)

    (motion-in ?r)
    (hot ?r)
    (dark ?r)

    (notified ?r)
  )

  (:action turn-on-light
    :parameters (?l ?r)
    :precondition (and
      (light-off ?l)
      (installed-in-light ?l ?r)
      (motion-in ?r)
      (dark ?r)
    )
    :effect (and (light-on ?l) (not (light-off ?l)))
  )

  (:action turn-off-light
    :parameters (?l ?r)
    :precondition (and
      (light-on ?l)
      (installed-in-light ?l ?r)
      (or (not (motion-in ?r)) (not (dark ?r)))
    )
    :effect (and (light-off ?l) (not (light-on ?l)))
  )

  (:action turn-on-conditioner
    :parameters (?c ?r)
    :precondition (and
      (conditioner-off ?c)
      (installed-in-conditioner ?c ?r)
      (motion-in ?r)
      (hot ?r)
    )
    :effect (and (conditioner-on ?c) (not (conditioner-off ?c)))
  )

  (:action turn-off-conditioner
    :parameters (?c ?r)
    :precondition (and
      (conditioner-on ?c)
      (installed-in-conditioner ?c ?r)
      (or (not (motion-in ?r)) (not (hot ?r)))
    )
    :effect (and (conditioner-off ?c) (not (conditioner-on ?c)))
  )

  (:action send-notification
    :parameters (?r)
    :precondition (and
      (motion-in ?r)
      (not (notified ?r))
    )
    :effect (notified ?r)
  )
)